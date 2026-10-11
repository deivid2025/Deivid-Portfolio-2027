import { NextResponse } from "next/server";
import { getProjectViews, incrementProjectViews, ensureProjectViewSeeds } from "@/lib/repo";

export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  await ensureProjectViewSeeds();
  const views = await incrementProjectViews(slug);
  if (views === 0) {
    return NextResponse.json(
      { error: "Proyecto no encontrado", slug },
      { status: 404, headers },
    );
  }
  return NextResponse.json({ slug, views }, { headers });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  await ensureProjectViewSeeds();
  const views = await getProjectViews(slug);
  if (views === 0) {
    return NextResponse.json(
      { error: "Proyecto no encontrado", slug },
      { status: 404, headers },
    );
  }
  return NextResponse.json({ slug, views }, { headers });
}
