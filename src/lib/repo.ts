import { db } from "@/lib/db";
import { projects } from "@/lib/projects";
import { updates as seedUpdates, testimonials as seedTestimonials } from "@/lib/content";

/**
 * Repository helpers for the portfolio persistence layer.
 *
 * Seeding strategy: the first time a read happens against an empty table, we
 * backfill it from the static content files (content.ts / projects.ts). After
 * that the DB is the source of truth, so admin edits would persist.
 */

export async function getProjectViews(slug: string): Promise<number> {
  const row = await db.projectView.findUnique({ where: { slug } });
  return row?.views ?? 0;
}

export async function incrementProjectViews(slug: string): Promise<number> {
  // Validate slug against the static project list to avoid junk rows.
  const exists = projects.some((p) => p.slug === slug);
  if (!exists) return 0;
  // Log a per-view event for real time-series analytics.
  try {
    await db.viewEvent.create({ data: { slug } });
  } catch {
    // best-effort; don't block the increment if event log fails
  }
  const row = await db.projectView.upsert({
    where: { slug },
    update: { views: { increment: 1 } },
    create: { slug, views: 1 },
  });
  return row.views;
}

// Module-level seed guards so concurrent first-requests don't race into
// duplicate inserts (P2002 on unique constraints).
let seedProjectViewsInFlight: Promise<void> | null = null;
let seedUpdatesInFlight: Promise<void> | null = null;
let seedTestimonialsInFlight: Promise<void> | null = null;

export async function ensureProjectViewSeeds(): Promise<void> {
  const count = await db.projectView.count();
  if (count > 0) return;
  if (!seedProjectViewsInFlight) {
    seedProjectViewsInFlight = (async () => {
      // Re-check inside the critical section.
      const c = await db.projectView.count();
      if (c > 0) return;
      // Use upsert per-row so concurrent writers don't trip on P2002.
      for (const p of projects) {
        await db.projectView.upsert({
          where: { slug: p.slug },
          update: {},
          create: { slug: p.slug, views: 120 + Math.floor(Math.random() * 540) },
        });
      }
    })().finally(() => {
      seedProjectViewsInFlight = null;
    });
  }
  await seedProjectViewsInFlight;
}

export async function createMessage(input: {
  name: string;
  email: string;
  message: string;
  ticket: string;
}) {
  return db.message.create({
    data: {
      name: input.name,
      email: input.email,
      message: input.message,
      ticket: input.ticket,
    },
  });
}

export async function listMessages(limit = 50) {
  return db.message.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUpdates() {
  await ensureUpdateSeeds();
  return db.update.findMany({ orderBy: { date: "desc" } });
}

export async function getUpdateBySlug(slug: string) {
  await ensureUpdateSeeds();
  const post = await db.update.findUnique({ where: { slug } });
  if (!post) return null;
  const related = await db.update.findMany({
    where: {
      project: post.project ?? undefined,
      NOT: { slug: post.slug },
    },
    take: 3,
    orderBy: { date: "desc" },
  });
  return { post, related };
}

export async function ensureUpdateSeeds(): Promise<void> {
  const count = await db.update.count();
  if (count > 0) return;
  if (!seedUpdatesInFlight) {
    seedUpdatesInFlight = (async () => {
      const c = await db.update.count();
      if (c > 0) return;
      for (const u of seedUpdates) {
        await db.update.upsert({
          where: { slug: u.slug },
          update: {},
          create: {
            slug: u.slug,
            title: u.title,
            excerpt: u.excerpt,
            body: u.body.join("\n\n"),
            date: new Date(u.date + "T00:00:00Z"),
            category: u.category,
            tags: u.tags.join(","),
            project: u.project ?? null,
            readTime: u.readTime,
          },
        });
      }
    })().finally(() => {
      seedUpdatesInFlight = null;
    });
  }
  await seedUpdatesInFlight;
}

export async function getTestimonials() {
  await ensureTestimonialSeeds();
  return db.testimonial.findMany({ orderBy: { createdAt: "asc" } });
}

export async function ensureTestimonialSeeds(): Promise<void> {
  const count = await db.testimonial.count();
  if (count > 0) return;
  if (!seedTestimonialsInFlight) {
    seedTestimonialsInFlight = (async () => {
      const c = await db.testimonial.count();
      if (c > 0) return;
      for (const t of seedTestimonials) {
        await db.testimonial.create({
          data: {
            name: t.name,
            role: t.role,
            company: t.company,
            quote: t.quote,
            rating: t.rating,
            avatarInitials: t.avatarInitials,
            accent: t.accent,
            project: t.project ?? null,
          },
        });
      }
    })().finally(() => {
      seedTestimonialsInFlight = null;
    });
  }
  await seedTestimonialsInFlight;
}

// ---------------------------------------------------------------------------
// Projects (dynamic, seeded from projects.ts)
// ---------------------------------------------------------------------------

let seedProjectsInFlight: Promise<void> | null = null;

export async function ensureProjectSeeds(): Promise<void> {
  const count = await db.projectRow.count();
  if (count > 0) return;
  if (!seedProjectsInFlight) {
    seedProjectsInFlight = (async () => {
      const c = await db.projectRow.count();
      if (c > 0) return;
      for (const p of projects) {
        await db.projectRow.upsert({
          where: { slug: p.slug },
          update: {},
          create: {
            slug: p.slug,
            name: p.name,
            tagline: p.tagline,
            category: p.category,
            status: p.status,
            year: p.year,
            url: p.url,
            accent: p.accent,
            icon: p.icon,
            screenshot: p.screenshot,
            summary: p.summary,
            description: p.description,
            longDescription: p.longDescription,
            features: JSON.stringify(p.features),
            metrics: JSON.stringify(p.metrics),
            techStack: JSON.stringify(p.techStack),
            highlights: JSON.stringify(p.highlights),
            audience: p.audience,
          },
        });
      }
    })().finally(() => {
      seedProjectsInFlight = null;
    });
  }
  await seedProjectsInFlight;
}

export async function getProjectRows() {
  await ensureProjectSeeds();
  const rows = await db.projectRow.findMany({ orderBy: { year: "desc" } });
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    tagline: r.tagline,
    category: r.category as
      | "Producto SaaS"
      | "E-commerce"
      | "Productividad IA"
      | "Logística",
    status: r.status as "live" | "beta" | "maintenance",
    year: r.year,
    url: r.url,
    accent: r.accent,
    icon: r.icon,
    screenshot: r.screenshot,
    summary: r.summary,
    description: r.description,
    longDescription: r.longDescription,
    features: JSON.parse(r.features) as Array<{ title: string; description: string }>,
    metrics: JSON.parse(r.metrics) as Array<{ label: string; value: string }>,
    techStack: JSON.parse(r.techStack) as Array<{ name: string; category: string }>,
    highlights: JSON.parse(r.highlights) as string[],
    audience: r.audience,
  }));
}

// ---------------------------------------------------------------------------
// Newsletter subscribers
// ---------------------------------------------------------------------------

export async function addSubscriber(email: string): Promise<{ ok: boolean; duplicate?: boolean }> {
  const existing = await db.subscriber.findUnique({ where: { email } });
  if (existing) {
    if (!existing.active) {
      await db.subscriber.update({ where: { email }, data: { active: true } });
    }
    return { ok: true, duplicate: true };
  }
  await db.subscriber.create({ data: { email } });
  return { ok: true };
}

export async function listSubscribers(limit = 100) {
  return db.subscriber.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
