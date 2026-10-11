import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await isAdmin(req);
  return NextResponse.json({ authenticated: admin, role: admin ? "admin" : null });
}
