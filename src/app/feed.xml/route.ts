import { db } from "@/lib/db";
import { ensureUpdateSeeds } from "@/lib/repo";
import { updates as staticUpdates } from "@/lib/content";
import { profile } from "@/lib/projects";

export const dynamic = "force-dynamic";

/** RSS 2.0 feed for the blog/updates section — reads from Prisma DB. */
export async function GET() {
  const siteUrl = "https://deividtech.cloud";

  let rows: Array<{
    slug: string;
    title: string;
    excerpt: string;
    date: Date;
    category: string;
    tags: string;
  }> = [];

  try {
    await ensureUpdateSeeds();
    rows = await db.update.findMany({ orderBy: { date: "desc" } });
  } catch {
    // Fallback to static content if DB is unavailable.
    rows = staticUpdates.map((u) => ({
      slug: u.slug,
      title: u.title,
      excerpt: u.excerpt,
      date: new Date(u.date + "T00:00:00Z"),
      category: u.category,
      tags: u.tags.join(","),
    }));
  }

  const items = rows
    .map((u) => {
      const url = `${siteUrl}/?update=${u.slug}#blog`;
      const pubDate = u.date.toUTCString();
      const tags = u.tags
        .split(",")
        .filter(Boolean)
        .map((t) => `<category>${t.trim()}</category>`)
        .join("\n      ");
      return `    <item>
      <title><![CDATA[${u.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${u.excerpt}]]></description>
      <category>${u.category}</category>
      ${tags}
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Deivid Tech — Devlog &amp; Novedades</title>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Releases, devlogs y casos de estudio de los proyectos en producción de David Garay.</description>
    <language>es-ar</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
