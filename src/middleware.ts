import { NextResponse } from "next/server";
import { verifyToken, adminCookie } from "@/lib/auth";

/**
 * Server-side route protection for /admin.
 *
 * Blocks any request to /admin that doesn't carry a valid AES-GCM
 * encrypted session cookie. Unauthed requests get redirected to
 * /admin/login (the separate login page) — so the dashboard HTML
 * is never served to unauthed visitors.
 *
 * The /api routes use the same cookie via the `isAdmin()` helper
 * in route handlers, so this middleware doesn't need to cover /api.
 */

export async function middleware(req: Request) {
  const { pathname } = new URL(req.url);

  // Allow the login page itself + login API to load without auth.
  if (pathname === "/admin/login" || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Read the cookie from the request headers.
  const cookieHeader = req.headers.get("cookie") ?? "";
  const token = parseCookie(cookieHeader, adminCookie.name);
  const authed = await verifyToken(token);
  if (authed) return NextResponse.next();

  // Unauthed → redirect to the login page. Carry the original path as a
  // `next` query param so we can bounce back to it after login.
  const loginUrl = new URL("/admin/login", req.url);
  if (pathname !== "/admin") {
    loginUrl.searchParams.set("next", pathname);
  }
  return NextResponse.redirect(loginUrl);
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

export const config = {
  // Protect everything under /admin except the login page itself.
  matcher: ["/admin/:path*"],
};
