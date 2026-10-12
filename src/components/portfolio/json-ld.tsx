import { db } from "@/lib/db";
import { ensureUpdateSeeds } from "@/lib/repo";
import { projects, profile } from "@/lib/projects";

/**
 * Server component that renders JSON-LD structured data generated dynamically
 * from the Prisma DB (updates/blog posts) + static project data.
 */
export async function JsonLd() {
  // Fetch updates from DB (with fallback to static).
  let updateRows: Array<{
    slug: string;
    title: string;
    date: Date;
  }> = [];

  try {
    await ensureUpdateSeeds();
    updateRows = await db.update.findMany({
      orderBy: { date: "desc" },
      select: { slug: true, title: true, date: true },
    });
  } catch {
    // Fallback handled by empty array — the blogPost list will just be shorter.
  }

  const blogPosts = updateRows.map((u) => ({
    "@type": "BlogPosting" as const,
    headline: u.title,
    datePublished: u.date.toISOString().slice(0, 10),
    url: `https://deividtech.cloud/?update=${u.slug}#blog`,
  }));

  const projectEntries = projects.map((p) => ({
    "@type": "SoftwareApplication" as const,
    name: p.name,
    applicationCategory: p.category,
    operatingSystem: "Web",
    url: p.url,
    description: p.summary,
    offers: {
      "@type": "Offer" as const,
      price: p.status === "beta" ? "0" : "3",
      priceCurrency: "USD",
    },
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://deividtech.cloud/#organization",
        name: "Deivid Tech",
        url: "https://deividtech.cloud",
        email: "davidgaray849@gmail.com",
        founder: {
          "@type": "Person",
          name: "Deivid",
          jobTitle: "Full-Stack Developer & Product Builder",
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://deividtech.cloud/#website",
        url: "https://deividtech.cloud",
        name: "Deivid Tech — Portfolio",
        description:
          "Portfolio de Deivid, full-stack developer & product builder. Sistemas en producción.",
        publisher: { "@id": "https://deividtech.cloud/#organization" },
        inLanguage: ["es", "pt"],
      },
      {
        "@type": "Blog",
        "@id": "https://deividtech.cloud/#blog",
        name: "Deivid Tech — Devlog",
        url: "https://deividtech.cloud/#blog",
        publisher: { "@id": "https://deividtech.cloud/#organization" },
        blogPost: blogPosts,
      },
      {
        "@type": "ProfilePage",
        "@id": "https://deividtech.cloud/#profile",
        url: "https://deividtech.cloud",
        mainEntity: {
          "@type": "Person",
          name: "Deivid",
          jobTitle: "Full-Stack Developer & Product Builder",
          knowsAbout: [
            "Python",
            "Next.js",
            "TypeScript",
            "React",
            "Tailwind CSS",
            "Docker",
            "PostgreSQL",
            "Supabase",
            "AI/LLM",
            "ChatGPT",
            "Claude",
            "Cursor",
            "Logistics software",
          ],
        },
      },
      ...projectEntries,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
