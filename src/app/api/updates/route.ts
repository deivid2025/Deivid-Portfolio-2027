import { NextResponse } from "next/server";
import { getUpdates } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await getUpdates();
  return NextResponse.json({
    count: rows.length,
    updates: rows.map((u) => ({
      slug: u.slug,
      title: u.title,
      excerpt: u.excerpt,
      body: u.body.split("\n\n"),
      date: u.date.toISOString().slice(0, 10),
      category: u.category,
      tags: u.tags.split(","),
      project: u.project ?? undefined,
      readTime: u.readTime,
    })),
  });
}
