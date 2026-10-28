import { NextResponse } from "next/server";
import { isAdmin, unauthorizedResponse, adminCookie } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Escape a CSV cell value per RFC 4180 — wrap in quotes if it contains
// a comma, quote, newline, or leading/trailing whitespace; double any
// embedded quotes.
function csvEscape(value: string): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s) || /^\s|\s$/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * GET /api/visitors/export
 *
 * Returns all visitor rows as a CSV file (UTF-8 BOM so Excel opens it
 * correctly with accented chars). Admin-only — protected by the same
 * AES-GCM cookie that the rest of the admin uses.
 *
 * The response sets Content-Disposition: attachment so the browser
 * downloads it as `visitors-YYYY-MM-DD.csv`. Useful for backups in
 * Dokploy — schedule a periodic fetch with the session cookie and
 * store the CSV offsite.
 */
export async function GET(req: Request) {
  if (!(await isAdmin(req))) return unauthorizedResponse();

  const visitors = await db.visitor.findMany({
    orderBy: { lastSeenAt: "desc" },
    select: {
      ipHash: true,
      country: true,
      countryName: true,
      city: true,
      region: true,
      deviceType: true,
      os: true,
      browser: true,
      visits: true,
      firstSeenAt: true,
      lastSeenAt: true,
    },
  });

  const header = [
    "ipHash",
    "country",
    "countryName",
    "city",
    "region",
    "deviceType",
    "os",
    "browser",
    "visits",
    "firstSeenAt",
    "lastSeenAt",
  ];

  const rows = visitors.map((v) =>
    [
      v.ipHash,
      v.country,
      v.countryName,
      v.city,
      v.region,
      v.deviceType,
      v.os,
      v.browser,
      String(v.visits),
      v.firstSeenAt.toISOString(),
      v.lastSeenAt.toISOString(),
    ]
      .map(csvEscape)
      .join(","),
  );

  // Prepend UTF-8 BOM (\uFEFF) so Excel/Numbers interpret it as UTF-8
  // even though CSV doesn't declare an encoding.
  const csv = `\uFEFF${header.join(",")}\n${rows.join("\n")}\n`;
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="visitors-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

// Expose the cookie name so external scripts (e.g. a Dokploy cron that
// logs in once and fetches the CSV) know which cookie to send.
export const GET_COOKIE_NAME = adminCookie.name;
