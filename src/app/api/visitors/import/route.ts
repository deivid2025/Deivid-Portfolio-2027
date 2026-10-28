import { NextResponse } from "next/server";
import { isAdmin, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/visitors/import
 *
 * Imports visitor rows from a CSV file uploaded by the admin. Used to
 * sync visitor data between instances — e.g. download CSV from the dev
 * environment, upload to production, and the visitor history is merged.
 *
 * CSV format (same as /api/visitors/export):
 *   ipHash,country,countryName,city,region,deviceType,os,browser,
 *   visits,firstSeenAt,lastSeenAt
 *
 * Upserts by ipHash — existing rows get their `visits` counter summed
 * (so importing a row that already exists adds the imported visits to
 * the existing count). firstSeenAt keeps the EARLIEST of the two,
 * lastSeenAt keeps the LATEST.
 */
export async function POST(req: Request) {
  if (!(await isAdmin(req))) return unauthorizedResponse();

  let text: string;
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Falta el archivo CSV en el campo 'file'." },
        { status: 400 },
      );
    }
    text = await file.text();
  } else {
    text = await req.text();
  }

  // Strip UTF-8 BOM if present.
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return NextResponse.json(
      { error: "CSV vacío o sin filas de datos." },
      { status: 400 },
    );
  }

  // Parse header — case-insensitive column lookup so we accept CSVs
  // exported with any casing (the export endpoint writes "ipHash" with
  // a capital H, but we accept any variation).
  const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const find = (name: string) =>
    header.findIndex((h) => h === name.toLowerCase());
  const colMap = {
    ipHash: find("ipHash"),
    country: find("country"),
    countryName: find("countryName"),
    city: find("city"),
    region: find("region"),
    deviceType: find("deviceType"),
    os: find("os"),
    browser: find("browser"),
    visits: find("visits"),
    firstSeenAt: find("firstSeenAt"),
    lastSeenAt: find("lastSeenAt"),
  };
  if (colMap.ipHash === -1 || colMap.visits === -1) {
    return NextResponse.json(
      { error: "CSV inválido — falta la columna ipHash o visits." },
      { status: 400 },
    );
  }

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const ipHash = cols[colMap.ipHash]?.trim();
    if (!ipHash) {
      skipped++;
      continue;
    }
    const visits = parseInt(cols[colMap.visits] ?? "1", 10) || 1;
    const country = cols[colMap.country]?.trim() || "Unknown";
    const countryName = cols[colMap.countryName]?.trim() || "Unknown";
    const city = cols[colMap.city]?.trim() || "Unknown";
    const region = cols[colMap.region]?.trim() || "Unknown";
    const deviceType = cols[colMap.deviceType]?.trim() || "Unknown";
    const os = cols[colMap.os]?.trim() || "Unknown";
    const browser = cols[colMap.browser]?.trim() || "Unknown";
    const firstSeenAt = colMap.firstSeenAt !== -1 && cols[colMap.firstSeenAt]
      ? new Date(cols[colMap.firstSeenAt])
      : new Date();
    const lastSeenAt = colMap.lastSeenAt !== -1 && cols[colMap.lastSeenAt]
      ? new Date(cols[colMap.lastSeenAt])
      : new Date();
    if (isNaN(firstSeenAt.getTime()) || isNaN(lastSeenAt.getTime())) {
      skipped++;
      errors.push(`Fila ${i + 1}: fecha inválida`);
      continue;
    }

    try {
      // Upsert — if the ipHash already exists, SUM the visits and
      // keep the earliest firstSeen / latest lastSeen.
      const existing = await db.visitor.findUnique({ where: { ipHash } });
      if (existing) {
        await db.visitor.update({
          where: { ipHash },
          data: {
            visits: existing.visits + visits,
            firstSeenAt: existing.firstSeenAt < firstSeenAt ? existing.firstSeenAt : firstSeenAt,
            lastSeenAt: existing.lastSeenAt > lastSeenAt ? existing.lastSeenAt : lastSeenAt,
            // Refresh geo/device data from the imported row (in case
            // the source had more recent info).
            country,
            countryName,
            city,
            region,
            deviceType,
            os,
            browser,
          },
        });
      } else {
        await db.visitor.create({
          data: {
            ipHash,
            country,
            countryName,
            city,
            region,
            deviceType,
            os,
            browser,
            visits,
            firstSeenAt,
            lastSeenAt,
          },
        });
      }
      imported++;
    } catch (err) {
      skipped++;
      errors.push(`Fila ${i + 1}: ${err instanceof Error ? err.message : "error"}`);
    }
  }

  return NextResponse.json({
    ok: true,
    imported,
    skipped,
    errors: errors.slice(0, 5),
  });
}

// Minimal RFC-4180 CSV line parser — handles quoted fields, escaped
// quotes ("") and embedded commas.
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
  }
  result.push(cur);
  return result;
}
