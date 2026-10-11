import { NextResponse } from "next/server";
import { isAdmin, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Aggregate ViewEvent rows older than `retentionDays` into a daily bucket
 * summary, then delete the raw rows to keep the table bounded.
 *
 * The aggregated buckets are returned in the response so the admin can see
 * what was cleaned up. Idempotent: safe to run multiple times.
 */
export async function POST(req: Request) {
  if (!(await isAdmin(req))) return unauthorizedResponse();

  let body: { retentionDays?: number };
  try {
    body = (await req.json()) as { retentionDays?: number };
  } catch {
    body = {};
  }
  const retentionDays = Number(body.retentionDays ?? 90);
  if (retentionDays < 1) {
    return NextResponse.json(
      { error: "retentionDays debe ser >= 1" },
      { status: 400 },
    );
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);
  cutoff.setHours(0, 0, 0, 0);

  // Find all distinct (slug, day) buckets older than cutoff.
  const oldEvents = await db.viewEvent.findMany({
    where: { createdAt: { lt: cutoff } },
    select: { slug: true, createdAt: true },
  });

  if (oldEvents.length === 0) {
    return NextResponse.json({
      ok: true,
      cleaned: 0,
      buckets: [],
      message: "No hay eventos viejos para limpiar.",
    });
  }

  // Aggregate in-memory (SQLite is fine for this volume).
  const buckets = new Map<string, { slug: string; date: string; count: number }>();
  for (const ev of oldEvents) {
    const day = ev.createdAt.toISOString().slice(0, 10);
    const key = `${ev.slug}|${day}`;
    const b = buckets.get(key) ?? { slug: ev.slug, date: day, count: 0 };
    b.count += 1;
    buckets.set(key, b);
  }

  // Delete the old raw events.
  const deleted = await db.viewEvent.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  return NextResponse.json({
    ok: true,
    cleaned: deleted.count,
    buckets: Array.from(buckets.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    ),
    retentionDays,
    cutoff: cutoff.toISOString(),
  });
}

/** GET returns the current ViewEvent count + oldest event date for monitoring. */
export async function GET(req: Request) {
  if (!(await isAdmin(req))) return unauthorizedResponse();
  const [count, oldest] = await Promise.all([
    db.viewEvent.count(),
    db.viewEvent.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
  ]);
  return NextResponse.json({
    totalEvents: count,
    oldestEvent: oldest?.createdAt ?? null,
  });
}
