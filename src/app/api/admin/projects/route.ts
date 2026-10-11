import { NextResponse } from "next/server";
import { isAdmin, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureProjectSeeds } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAdmin(req))) return unauthorizedResponse();
  await ensureProjectSeeds();
  const rows = await db.projectRow.findMany({ orderBy: { year: "desc" } });
  return NextResponse.json({ count: rows.length, projects: rows });
}

interface ProjectInput {
  slug?: string;
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
  features?: string; // JSON
  metrics?: string; // JSON
  techStack?: string; // JSON
  highlights?: string; // JSON
  audience?: string;
}

export async function POST(req: Request) {
  if (!(await isAdmin(req))) return unauthorizedResponse();
  let body: ProjectInput;
  try {
    body = (await req.json()) as ProjectInput;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }
  const slug = (body.slug ?? "").trim();
  const name = (body.name ?? "").trim();
  if (!slug || !name) {
    return NextResponse.json(
      { error: "Slug y nombre son obligatorios." },
      { status: 400 },
    );
  }
  const existing = await db.projectRow.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "Ya existe un proyecto con ese slug." },
      { status: 409 },
    );
  }
  const created = await db.projectRow.create({
    data: {
      slug,
      name,
      tagline: (body.tagline ?? "").trim(),
      category: (body.category ?? "Producto SaaS"),
      status: (body.status ?? "live"),
      year: (body.year ?? String(new Date().getFullYear())),
      url: (body.url ?? "").trim(),
      accent: (body.accent ?? "from-amber-500 via-orange-500 to-rose-500"),
      icon: (body.icon ?? "Rocket"),
      screenshot: (body.screenshot ?? "/screenshots/despega-peelme.png"),
      summary: (body.summary ?? "").trim(),
      description: (body.description ?? "").trim(),
      longDescription: (body.longDescription ?? "").trim(),
      features: body.features ?? "[]",
      metrics: body.metrics ?? "[]",
      techStack: body.techStack ?? "[]",
      highlights: body.highlights ?? "[]",
      audience: (body.audience ?? "").trim(),
    },
  });
  return NextResponse.json({ ok: true, project: created });
}
