import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHash } from "node:crypto";

export const dynamic = "force-dynamic";

// IP geolocation cache (per-request). We use the free ip-api.com service
// which doesn't require an API key for low-volume usage (45 req/min).
// Falls back gracefully to "Unknown" on any error.
type GeoInfo = {
  countryCode: string;
  countryName: string;
  regionName: string;
  city: string;
};

const geoCache = new Map<string, GeoInfo>();

async function lookupGeo(ip: string): Promise<GeoInfo> {
  // Don't geolocate local/private IPs.
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") ||
      ip.startsWith("10.") || ip.startsWith("172.") || ip === "localhost") {
    return { countryCode: "LO", countryName: "Local", regionName: "Local", city: "Local" };
  }
  if (geoCache.has(ip)) return geoCache.get(ip)!;
  try {
    const url = `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city`;
    const r = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (!r.ok) throw new Error(`geo ${r.status}`);
    const data = await r.json() as {
      status: string;
      country?: string;
      countryCode?: string;
      regionName?: string;
      city?: string;
    };
    if (data.status !== "success") throw new Error("geo failed");
    const info: GeoInfo = {
      countryCode: data.countryCode ?? "Unknown",
      countryName: data.country ?? "Unknown",
      regionName: data.regionName ?? "Unknown",
      city: data.city ?? "Unknown",
    };
    geoCache.set(ip, info);
    return info;
  } catch {
    const fallback: GeoInfo = {
      countryCode: "Unknown",
      countryName: "Unknown",
      regionName: "Unknown",
      city: "Unknown",
    };
    geoCache.set(ip, fallback);
    return fallback;
  }
}

// Parse the User-Agent header to extract device type, OS, and browser.
type DeviceInfo = {
  deviceType: "mobile" | "tablet" | "desktop" | "bot";
  os: string;
  browser: string;
};

function parseUserAgent(ua: string): DeviceInfo {
  const lc = (ua || "").toLowerCase();
  let deviceType: DeviceInfo["deviceType"] = "desktop";
  if (lc.includes("bot") || lc.includes("spider") || lc.includes("crawler") ||
      lc.includes("slurp") || lc.includes("headless")) {
    deviceType = "bot";
  } else if (lc.includes("ipad") || lc.includes("tablet")) {
    deviceType = "tablet";
  } else if (lc.includes("android") || lc.includes("iphone") ||
             lc.includes("mobile") || lc.includes("windows phone")) {
    deviceType = "mobile";
  }

  let os = "Unknown";
  if (lc.includes("windows")) os = "Windows";
  else if (lc.includes("mac os") || lc.includes("macintosh")) os = "macOS";
  else if (lc.includes("android")) os = "Android";
  else if (lc.includes("iphone") || lc.includes("ipad") || lc.includes("ios")) os = "iOS";
  else if (lc.includes("linux")) os = "Linux";
  else if (lc.includes("freebsd")) os = "FreeBSD";
  else if (deviceType === "bot") os = "Bot";

  let browser = "Unknown";
  if (lc.includes("edg/")) browser = "Edge";
  else if (lc.includes("chrome/") || lc.includes("crios")) browser = "Chrome";
  else if (lc.includes("firefox/") || lc.includes("fxios")) browser = "Firefox";
  else if (lc.includes("safari/") && !lc.includes("chrome")) browser = "Safari";
  else if (lc.includes("opr/") || lc.includes("opera")) browser = "Opera";
  else if (deviceType === "bot") browser = "Bot";

  return { deviceType, os, browser };
}

// Extract the real client IP from request headers. Behind the Caddy gateway
// the IP arrives in X-Forwarded-For (or X-Real-IP).
function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0].trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "127.0.0.1";
}

// Stable salt for the day — lets us dedupe per IP per day without storing
// the raw IP. We rotate the salt daily so a hash from yesterday doesn't
// match today's hash for the same IP.
function dailySalt(): string {
  const d = new Date();
  const key = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
  return createHash("sha256").update(`visitor-salt-${key}`).digest("hex").slice(0, 16);
}

export async function POST(req: Request) {
  try {
    const ua = req.headers.get("user-agent") ?? "";
    const ip = getClientIp(req);

    // Run UA parsing + Geo lookup in parallel.
    const [{ deviceType, os, browser }, geo] = await Promise.all([
      Promise.resolve(parseUserAgent(ua)),
      lookupGeo(ip),
    ]);

    // Include deviceType in the hash so a visitor who switches devices
    // (e.g. mobile today, desktop tomorrow) gets tracked as separate
    // rows — preserves the per-device-type visit count.
    const ipHash = createHash("sha256")
      .update(`${ip}::${dailySalt()}::${deviceType}`)
      .digest("hex");

    // Upsert the visitor record. If the IP hash already exists today,
    // increment visits + update lastSeenAt + (re)sync the geo/device info
    // in case the user is roaming networks or switched browsers.
    await db.visitor.upsert({
      where: { ipHash },
      create: {
        ipHash,
        country: geo.countryCode,
        countryName: geo.countryName,
        city: geo.city,
        region: geo.regionName,
        deviceType,
        os,
        browser,
        visits: 1,
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
      },
      update: {
        country: geo.countryCode,
        countryName: geo.countryName,
        city: geo.city,
        region: geo.regionName,
        deviceType,
        os,
        browser,
        visits: { increment: 1 },
        lastSeenAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, country: geo.countryName });
  } catch (err) {
    // Never break the page render if tracking fails — it's best-effort.
    console.error("[visitors/track] error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
