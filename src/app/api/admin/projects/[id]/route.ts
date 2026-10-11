import { NextResponse } from "next/server";
import { isAdmin, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface ProjectInput {
  name?: string;
  tagline?: string;
  category?: string;
  status?: string;
  year?: string;
  url?: string;
  accent?: string;
  icon?: string;
  screenshot?: string;
  summary?: string;
  description?: string;
  longDescription?: string;
  features?: string;
  metrics?: string;
  techStack?: string;
  highlights?: string;
  audience?: string;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin(req))) return unauthorizedResponse();
  const { id } = await params;
  let body: ProjectInput;
  try {
    body = (await req.json()) as ProjectInput;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }
  const existing = await db.projectRow.findUnique({ where: { slug: id } });
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name.trim();
  if (body.tagline !== undefined) data.tagline = body.tagline.trim();
  if (body.category !== undefined) data.category = body.category;
  if (body.status !== undefined) data.status = body.status;
  if (body.year !== undefined) data.year = body.year;
  if (body.url !== undefined) data.url = body.url.trim();
  if (body.accent !== undefined) data.accent = body.accent;
  if (body.icon !== undefined) data.icon = body.icon;
  if (body.screenshot !== undefined) data.screenshot = body.screenshot;
  if (body.summary !== undefined) data.summary = body.summary.trim();
  if (body.description !== undefined) data.description = body.description.trim();
  if (body.longDescription !== undefined) data.longDescription = body.longDescription.trim();
  if (body.features !== undefined) data.features = body.features;
  if (body.metrics !== undefined) data.metrics = body.metrics;
  if (body.techStack !== undefined) data.techStack = body.techStack;
  if (body.highlights !== undefined) data.highlights = body.highlights;
  if (body.audience !== undefined) data.audience = body.audience.trim();

  const updated = await db.projectRow.update({ where: { slug: id }, data });
  return NextResponse.json({ ok: true, project: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin(req))) return unauthorizedResponse();
  const { id } = await params;
  try {
    await db.projectRow.delete({ where: { slug: id } });
  } catch {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
