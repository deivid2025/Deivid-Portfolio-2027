import { NextResponse } from "next/server";
import { getTestimonials } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await getTestimonials();
  return NextResponse.json({
    count: rows.length,
    testimonials: rows.map((t) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      company: t.company,
      quote: t.quote,
      rating: t.rating,
      avatarInitials: t.avatarInitials,
      accent: t.accent,
      project: t.project ?? undefined,
    })),
  });
}
