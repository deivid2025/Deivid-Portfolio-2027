import { NextResponse } from "next/server";
import { addSubscriber } from "@/lib/repo";
import { forwardSubscriberNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = (await req.json()) as { email?: string };
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de petición inválido." },
      { status: 400 },
    );
  }
  const email = (body.email ?? "").trim().toLowerCase();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return NextResponse.json(
      { error: "Necesito un email válido." },
      { status: 400 },
    );
  }
  try {
    const result = await addSubscriber(email);
    // Best-effort email notification to David when a NEW subscriber
    // joins (skip notification for duplicates — they're already subscribed).
    if (!result.duplicate) {
      void forwardSubscriberNotification({ email }).catch((err) => {
        console.error("[subscribe] email notification threw:", err);
      });
    }
    return NextResponse.json({
      ok: true,
      duplicate: result.duplicate ?? false,
    });
  } catch (err) {
    console.error("[subscribe] failed", err);
    return NextResponse.json(
      { error: "No te pude suscribir. Probá de nuevo." },
      { status: 500 },
    );
  }
}
