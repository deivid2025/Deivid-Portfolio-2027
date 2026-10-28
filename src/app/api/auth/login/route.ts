import { NextResponse } from "next/server";
import { checkPassword, mintToken, adminCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de petición inválido." },
      { status: 400 },
    );
  }
  const password = (body.password ?? "").trim();
  if (!checkPassword(password)) {
    return NextResponse.json(
      { error: "Contraseña incorrecta." },
      { status: 401 },
    );
  }
  const token = await mintToken();
  const flags = adminCookie.flags;
  const cookieParts = [
    `${adminCookie.name}=${encodeURIComponent(token)}`,
    "HttpOnly",
    `Path=${flags.path}`,
    `Max-Age=${adminCookie.maxAge}`,
    `SameSite=${flags.sameSite}`,
  ];
  if (flags.secure) cookieParts.push("Secure");
  const res = NextResponse.json({ ok: true, role: "admin" });
  res.headers.set("set-cookie", cookieParts.join("; "));
  return res;
}
