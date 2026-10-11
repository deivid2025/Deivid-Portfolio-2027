import { NextResponse } from "next/server";
import { isAdmin, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface UpdateInput {
  slug?: string;
  title?: string;
  excerpt?: string;
  body?: string; // newline-separated paragraphs
  date?: string; // YYYY-MM-DD
  category?: string;
  tags?: string; // comma-separated
  project?: string | null;
  readTime?: number;
}

export async function GET(req: Request) {
  if (!(await isAdmin(req))) return unauthorizedResponse();
  const updates = await db.update.findMany({
    orderBy: { date: "desc" },
  });
  return NextResponse.json({ count: updates.length, updates });
}

export async function POST(req: Request) {
  if (!(await isAdmin(req))) return unauthorizedResponse();
  let body: UpdateInput;
  try {
    body = (await req.json()) as UpdateInput;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }
  const slug = (body.slug ?? "").trim();
  const title = (body.title ?? "").trim();
  if (!slug || !title) {
    return NextResponse.json(
      { error: "Slug y título son obligatorios." },
      { status: 400 },
    );
  }
  const existing = await db.update.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "Ya existe un update con ese slug." },
      { status: 409 },
    );
  }
  const created = await db.update.create({
    data: {
      slug,
      title,
      excerpt: (body.excerpt ?? "").trim(),
      body: (body.body ?? "").trim(),
      date: body.date ? new Date(body.date + "T00:00:00Z") : new Date(),
      category: (body.category ?? "devlog") as string,
      tags: (body.tags ?? "").trim(),
      project: body.project ?? null,
      readTime: Number(body.readTime ?? 2),
    },
  });
  return NextResponse.json({ ok: true, update: created });
}
