import { NextResponse } from "next/server";
import { adminCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.set(
    "set-cookie",
    `${adminCookie.name}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`,
  );
  return res;
}
