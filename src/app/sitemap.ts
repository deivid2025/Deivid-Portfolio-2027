import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { updates } from "@/lib/content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://deividtech.cloud";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/#work`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/#blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/#about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/#contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/admin`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${siteUrl}/?project=${p.slug}#work`,
    lastModified: new Date(p.year + "-01-01"),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const updateRoutes: MetadataRoute.Sitemap = updates.map((u) => ({
    url: `${siteUrl}/?update=${u.slug}#blog`,
    lastModified: new Date(u.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes, ...updateRoutes];
}
