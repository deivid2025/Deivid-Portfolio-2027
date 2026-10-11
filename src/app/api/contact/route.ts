import { NextResponse } from "next/server";
import { createMessage } from "@/lib/repo";

export const dynamic = "force-dynamic";

interface ContactPayload {
  name?: string;
  email?: string;
  message?: string;
  bot?: string; // honeypot
}

export async function POST(req: Request) {
  let body: ContactPayload;
  try {
    body = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de la petición inválido." },
      { status: 400 },
    );
  }

  // Honeypot anti-spam
  if (body.bot) {
    return NextResponse.json({ ok: true, spam: true });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();

  if (name.length < 2) {
    return NextResponse.json(
      { error: "Decime tu nombre (mínimo 2 caracteres)." },
      { status: 400 },
    );
  }
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return NextResponse.json(
      { error: "Necesito un email válido para responderte." },
      { status: 400 },
    );
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: "Contame un poco más sobre tu proyecto (mínimo 10 caracteres)." },
      { status: 400 },
    );
  }

  const ticket = `DT-${Date.now().toString(36).toUpperCase()}`;

  try {
    await createMessage({ name, email, message, ticket });
  } catch (err) {
    console.error("[contact] failed to persist message", err);
    // Still return ok so the UI can show success — we don't want to leak
    // DB errors to the visitor. The ticket is the correlation id.
  }

  return NextResponse.json({
    ok: true,
    ticket,
    receivedAt: new Date().toISOString(),
    summary: { name, email, messageLength: message.length },
  });
}
