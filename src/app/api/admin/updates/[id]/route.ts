import { NextResponse } from "next/server";
import { isAdmin, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface UpdateInput {
  slug?: string;
  title?: string;
  excerpt?: string;
  body?: string;
  date?: string;
  category?: string;
  tags?: string;
  project?: string | null;
  readTime?: number;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin(req))) return unauthorizedResponse();
  const { id } = await params;
  let body: UpdateInput;
  try {
    body = (await req.json()) as UpdateInput;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }
  const existing = await db.update.findUnique({ where: { slug: id } });
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title.trim();
  if (body.excerpt !== undefined) data.excerpt = body.excerpt.trim();
  if (body.body !== undefined) data.body = body.body.trim();
  if (body.date) data.date = new Date(body.date + "T00:00:00Z");
  if (body.category !== undefined) data.category = body.category;
  if (body.tags !== undefined) data.tags = body.tags.trim();
  if (body.project !== undefined) data.project = body.project || null;
  if (body.readTime !== undefined) data.readTime = Number(body.readTime);

  const updated = await db.update.update({
    where: { slug: id },
    data,
  });
  return NextResponse.json({ ok: true, update: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin(req))) return unauthorizedResponse();
  const { id } = await params;
  try {
    await db.update.delete({ where: { slug: id } });
  } catch {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
