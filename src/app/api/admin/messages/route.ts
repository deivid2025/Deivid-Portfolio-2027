import { NextResponse } from "next/server";
import { isAdmin, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAdmin(req))) return unauthorizedResponse();
  const messages = await db.message.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ count: messages.length, messages });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin(req))) return unauthorizedResponse();
  let body: { id?: string };
  try {
    body = (await req.json()) as { id?: string };
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ error: "Falta id" }, { status: 400 });
  }
  await db.message.delete({ where: { id: body.id } });
  return NextResponse.json({ ok: true });
}
