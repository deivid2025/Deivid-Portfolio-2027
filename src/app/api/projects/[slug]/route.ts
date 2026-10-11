import { NextResponse } from "next/server";
import { getProjectBySlug } from "@/lib/projects";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    return NextResponse.json(
      { error: "Proyecto no encontrado", slug },
      { status: 404 },
    );
  }
  return NextResponse.json({ project });
}
