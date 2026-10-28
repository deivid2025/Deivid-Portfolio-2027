import { NextResponse } from "next/server";
import { createMessage } from "@/lib/repo";
import { forwardContactMessage } from "@/lib/email";

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

  // Best-effort email forward to David's inbox. SMTP transport is loaded
  // lazily and cached. If SMTP env vars aren't set, this no-ops and the
  // message stays only in the DB (visible in /admin → Mensajes).
  // Not awaited to keep the response fast — email delivery can take 1-3s
  // depending on the SMTP provider, and we don't want the visitor to wait.
  void forwardContactMessage({ name, email, message, ticket }).catch((err) => {
    console.error("[contact] email forward threw:", err);
  });

  return NextResponse.json({
    ok: true,
    ticket,
    receivedAt: new Date().toISOString(),
    summary: { name, email, messageLength: message.length },
  });
}
