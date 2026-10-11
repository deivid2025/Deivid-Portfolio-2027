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

export async function GET(req: Request) {
  if (!(await isAdmin(req))) return unauthorizedResponse();
  const testimonials = await db.testimonial.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ count: testimonials.length, testimonials });
}

export async function POST(req: Request) {
  if (!(await isAdmin(req))) return unauthorizedResponse();
  let body: TestimonialInput;
  try {
    body = (await req.json()) as TestimonialInput;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }
  const name = (body.name ?? "").trim();
  const quote = (body.quote ?? "").trim();
  if (!name || !quote) {
    return NextResponse.json(
      { error: "Nombre y testimonio son obligatorios." },
      { status: 400 },
    );
  }
  const created = await db.testimonial.create({
    data: {
      name,
      role: (body.role ?? "").trim(),
      company: (body.company ?? "").trim(),
      quote,
      rating: Number(body.rating ?? 5),
      avatarInitials: (body.avatarInitials ?? name.slice(0, 2).toUpperCase()),
      accent: (body.accent ?? "from-amber-500 to-orange-600"),
      project: body.project ?? null,
    },
  });
  return NextResponse.json({ ok: true, testimonial: created });
}
