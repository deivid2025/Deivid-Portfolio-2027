import { NextResponse } from "next/server";
import { isAdmin, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface TestimonialInput {
  name?: string;
  role?: string;
  company?: string;
  quote?: string;
  rating?: number;
  avatarInitials?: string;
  accent?: string;
  project?: string | null;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin(req))) return unauthorizedResponse();
  const { id } = await params;
  let body: TestimonialInput;
  try {
    body = (await req.json()) as TestimonialInput;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }
  const existing = await db.testimonial.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name.trim();
  if (body.role !== undefined) data.role = body.role.trim();
  if (body.company !== undefined) data.company = body.company.trim();
  if (body.quote !== undefined) data.quote = body.quote.trim();
  if (body.rating !== undefined) data.rating = Number(body.rating);
  if (body.avatarInitials !== undefined) data.avatarInitials = body.avatarInitials;
  if (body.accent !== undefined) data.accent = body.accent;
  if (body.project !== undefined) data.project = body.project || null;

  const updated = await db.testimonial.update({ where: { id }, data });
  return NextResponse.json({ ok: true, testimonial: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin(req))) return unauthorizedResponse();
  const { id } = await params;
  try {
    await db.testimonial.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
