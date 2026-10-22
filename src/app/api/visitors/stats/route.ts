import { NextResponse } from "next/server";
import { isAdmin, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAdmin(req))) return unauthorizedResponse();

  // Aggregate all visitor rows. SQLite + Prisma can do the grouping server-side
  // but the visitor table is small enough (per-day per-IP rows) that we can
  // pull all rows and aggregate in JS — keeps the query simple and avoids
  // needing raw SQL for GROUP BY.
  const visitors = await db.visitor.findMany({
    select: {
      country: true,
      countryName: true,
      deviceType: true,
      os: true,
      browser: true,
      visits: true,
      lastSeenAt: true,
      firstSeenAt: true,
    },
  });

  const totalVisits = visitors.reduce((acc, v) => acc + v.visits, 0);
  const uniqueVisitors = visitors.length;

  // Top countries by total visits.
  const byCountry = new Map<string, { country: string; countryName: string; visits: number; unique: number }>();
  for (const v of visitors) {
    const existing = byCountry.get(v.country) ?? {
      country: v.country,
      countryName: v.countryName,
      visits: 0,
      unique: 0,
    };
    existing.visits += v.visits;
    existing.unique += 1;
    byCountry.set(v.country, existing);
  }
  const topCountries = Array.from(byCountry.values())
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10);

  // Top devices by total visits.
  const byDevice = new Map<string, { deviceType: string; visits: number; unique: number }>();
  for (const v of visitors) {
    const existing = byDevice.get(v.deviceType) ?? { deviceType: v.deviceType, visits: 0, unique: 0 };
    existing.visits += v.visits;
    existing.unique += 1;
    byDevice.set(v.deviceType, existing);
  }
  const topDevices = Array.from(byDevice.values())
    .sort((a, b) => b.visits - a.visits);

  // Top OS.
  const byOs = new Map<string, { os: string; visits: number; unique: number }>();
  for (const v of visitors) {
    const existing = byOs.get(v.os) ?? { os: v.os, visits: 0, unique: 0 };
    existing.visits += v.visits;
    existing.unique += 1;
    byOs.set(v.os, existing);
  }
  const topOs = Array.from(byOs.values())
    .sort((a, b) => b.visits - a.visits);

  // Top browsers.
  const byBrowser = new Map<string, { browser: string; visits: number; unique: number }>();
  for (const v of visitors) {
    const existing = byBrowser.get(v.browser) ?? { browser: v.browser, visits: 0, unique: 0 };
    existing.visits += v.visits;
    existing.unique += 1;
    byBrowser.set(v.browser, existing);
  }
  const topBrowsers = Array.from(byBrowser.values())
    .sort((a, b) => b.visits - a.visits);

  // Visits in last 24h + last 7 days.
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const visits24h = visitors
    .filter((v) => v.lastSeenAt >= dayAgo)
    .reduce((acc, v) => acc + v.visits, 0);
  const visits7d = visitors
    .filter((v) => v.lastSeenAt >= weekAgo)
    .reduce((acc, v) => acc + v.visits, 0);
  const unique24h = visitors.filter((v) => v.lastSeenAt >= dayAgo).length;
  const unique7d = visitors.filter((v) => v.lastSeenAt >= weekAgo).length;

  return NextResponse.json({
    totals: {
      totalVisits,
      uniqueVisitors,
      visits24h,
      visits7d,
      unique24h,
      unique7d,
    },
    topCountries,
    topDevices,
    topOs,
    topBrowsers,
  });
}
