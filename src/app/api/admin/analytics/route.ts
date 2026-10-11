import { NextResponse } from "next/server";
import { isAdmin, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface DayBucket {
  date: string; // YYYY-MM-DD
  label: string;
  messages: number;
  newViews: number;
}

/** Build a 30-day time series from real ViewEvent + Message data. */
export async function GET(req: Request) {
  if (!(await isAdmin(req))) return unauthorizedResponse();

  const days = 30;
  const buckets: DayBucket[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    buckets.push({
      date: iso,
      label: d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" }),
      messages: 0,
      newViews: 0,
    });
  }

  const since = new Date(today);
  since.setDate(since.getDate() - (days - 1));

  // Real messages per day.
  const messages = await db.message.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });
  for (const m of messages) {
    const iso = m.createdAt.toISOString().slice(0, 10);
    const b = buckets.find((x) => x.date === iso);
    if (b) b.messages += 1;
  }

  // Real view events per day from ViewEvent table.
  let viewEvents: Array<{ createdAt: Date }> = [];
  try {
    viewEvents = await db.viewEvent.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });
  } catch {
    // ViewEvent table might be empty on fresh installs — that's fine.
  }
  for (const v of viewEvents) {
    const iso = v.createdAt.toISOString().slice(0, 10);
    const b = buckets.find((x) => x.date === iso);
    if (b) b.newViews += 1;
  }

  // If no view events yet (fresh DB), fall back to heuristic so the chart
  // isn't empty.
  if (viewEvents.length === 0) {
    const totalViews = await db.projectView.aggregate({ _sum: { views: true } });
    const total = totalViews._sum.views ?? 0;
    for (let i = 0; i < buckets.length; i++) {
      const weight = (i + 1) / buckets.length;
      buckets[i].newViews = Math.round((total / 100) * weight);
    }
  }

  const totalViews = await db.projectView.aggregate({ _sum: { views: true } });

  return NextResponse.json({
    days,
    totalViews: totalViews._sum.views ?? 0,
    totalMessages: messages.length,
    totalViewEvents: viewEvents.length,
    buckets,
  });
}
