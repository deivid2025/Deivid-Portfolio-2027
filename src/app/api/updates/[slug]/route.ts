import { NextResponse } from "next/server";
import { getUpdateBySlug } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const result = await getUpdateBySlug(slug);
  if (!result) {
    return NextResponse.json(
      { error: "Update no encontrado", slug },
      { status: 404 },
    );
  }
  const { post, related } = result;
  return NextResponse.json({
    post: {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      body: post.body.split("\n\n"),
      date: post.date.toISOString().slice(0, 10),
      category: post.category,
      tags: post.tags.split(","),
      project: post.project ?? undefined,
      readTime: post.readTime,
    },
    related: related.map((r) => ({
      slug: r.slug,
      title: r.title,
      date: r.date.toISOString().slice(0, 10),
    })),
  });
}
