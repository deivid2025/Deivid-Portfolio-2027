import { NextResponse } from "next/server";

/**
 * Minimal auth helpers for the admin area. We don't use NextAuth because
 * NextAuth v4 has compatibility issues with Next.js 16 + Turbopack runtime.
 *
 * Strategy: a single admin password from env. On successful login we mint a
 * signed JWT-like token (HMAC over payload) stored in an httpOnly cookie.
 * Route handlers verify the token to protect admin endpoints.
 */

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ?? "deivid-admin-2026";

const SECRET =
  process.env.NEXTAUTH_SECRET ??
  "dev-only-secret-please-override-in-production-deivid-tech-portfolio";

const COOKIE_NAME = "deivid_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 1 week

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function mintToken(): Promise<string> {
  const exp = Date.now() + COOKIE_MAX_AGE * 1000;
  const payload = `admin:${exp}`;
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

export async function verifyToken(token: string | null | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expectedSig = await hmac(payload);
  if (sig !== expectedSig) return false;
  const [role, expStr] = payload.split(":");
  if (role !== "admin") return false;
  const exp = Number(expStr);
  if (!exp || Date.now() > exp) return false;
  return true;
}

export function checkPassword(input: string): boolean {
  return input === ADMIN_PASSWORD;
}

export const adminCookie = {
  name: COOKIE_NAME,
  maxAge: COOKIE_MAX_AGE,
};

/** Helper for route handlers: returns true if the request is authenticated. */
export async function isAdmin(req: Request): Promise<boolean> {
  const cookie = req.headers.get("cookie") ?? "";
  const token = parseCookie(cookie, COOKIE_NAME);
  return verifyToken(token);
}

function parseCookie(header: string, name: string): string | null {
  const parts = header.split(";").map((p) => p.trim());
  for (const p of parts) {
    const eq = p.indexOf("=");
    if (eq === -1) continue;
    const k = p.slice(0, eq);
    const v = p.slice(eq + 1);
    if (k === name) return decodeURIComponent(v);
  }
  return null;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}
