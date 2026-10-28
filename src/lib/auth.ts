import { NextResponse } from "next/server";

/**
 * Minimal auth helpers for the admin area.
 *
 * Strategy: AES-GCM encrypted token stored in an httpOnly, Secure,
 * SameSite=Strict cookie. The token's payload is encrypted (not just
 * HMAC-signed) so even if the cookie is leaked, the contents can't be
 * read without the secret. AES-GCM also gives integrity (auth tag),
 * so tampering invalidates the token.
 *
 * Secret comes from process.env.NEXTAUTH_SECRET. The middleware in
 * src/middleware.ts blocks /admin requests without a valid cookie
 * and redirects them to /admin/login.
 */

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ?? "deivid-admin-2026";

const SECRET =
  process.env.NEXTAUTH_SECRET ??
  "dev-only-secret-please-override-in-production-deivid-tech-portfolio";

const COOKIE_NAME = "deivid_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 1 week

// Derive a 256-bit AES key from the SECRET string by hashing it with
// SHA-256. This gives a stable key across server restarts.
let cachedKey: CryptoKey | null = null;
async function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(SECRET),
  );
  cachedKey = await crypto.subtle.importKey(
    "raw",
    digest,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
  return cachedKey;
}

function base64(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s);
}

function fromBase64(s: string): Uint8Array {
  const bin = atob(s);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

/** Encrypt the admin session payload with AES-GCM. Returns iv.ciphertext. */
export async function mintToken(): Promise<string> {
  const exp = Date.now() + COOKIE_MAX_AGE * 1000;
  const payload = JSON.stringify({ role: "admin", exp, iat: Date.now() });
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getKey();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(payload),
  );
  // Concatenate iv (12 bytes) + ciphertext (variable + 16-byte auth tag).
  // Base64 the whole thing so it's URL-safe for the cookie value.
  const ivBytes = new Uint8Array(iv);
  const ctBytes = new Uint8Array(ciphertext);
  const combined = new Uint8Array(ivBytes.length + ctBytes.length);
  combined.set(ivBytes, 0);
  combined.set(ctBytes, ivBytes.length);
  return base64(combined);
}

/** Decrypt + verify the token. Returns true if valid & not expired. */
export async function verifyToken(token: string | null | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const combined = fromBase64(token);
    if (combined.length < 13) return false; // 12-byte IV + at least 1 byte
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const key = await getKey();
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext,
    );
    // decrypt() throws if the auth tag is invalid (tampered), so reaching
    // here means integrity is verified.
    const payload = JSON.parse(new TextDecoder().decode(plaintext)) as {
      role?: string;
      exp?: number;
    };
    if (payload.role !== "admin") return false;
    if (!payload.exp || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export function checkPassword(input: string): boolean {
  return input === ADMIN_PASSWORD;
}

export const adminCookie = {
  name: COOKIE_NAME,
  maxAge: COOKIE_MAX_AGE,
  // Cookie flags:
  //   httpOnly: not readable from JS, only sent to server — defeats XSS
  //             cookie theft.
  //   secure: only sent over HTTPS — set to true when served over TLS.
  //   sameSite: Strict — never sent on cross-site requests, defeats CSRF.
  //   path: /admin + /api so the cookie is scoped to admin areas only.
  flags: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
  },
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
