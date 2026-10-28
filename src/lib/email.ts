import type { Transporter } from "nodemailer";
import { profile } from "@/lib/projects";

/**
 * Email forwarding helper.
 *
 * Sends contact-form messages and new-subscriber notifications to
 * David's inbox (davidgaray849@gmail.com) via SMTP. Degrades gracefully
 * to DB-only persistence when SMTP env vars aren't set — so the site
 * works on first deploy without email config, and the user can opt in
 * later by adding the env vars.
 *
 * Configuration (.env):
 *   SMTP_HOST      = smtp.gmail.com (or smtp.office365.com, etc.)
 *   SMTP_PORT      = 465 (SSL) or 587 (STARTTLS)
 *   SMTP_USER      = sender@email.com
 *   SMTP_PASS      = app-specific password (NOT the regular password)
 *   SMTP_FROM      = optional "Name <from@email.com>" — defaults to SMTP_USER
 *   SMTP_TO        = optional override of the destination inbox —
 *                    defaults to profile.email (davidgaray849@gmail.com)
 */

let cachedTransport: Transporter | null = null;
let cachedConfig: SmtpConfig | null = null;

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean; // true for 465, false for 587
  user: string;
  pass: string;
  from: string;
  to: string;
}

function readConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const portRaw = process.env.SMTP_PORT?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) return null;
  const port = portRaw ? Number(portRaw) : 587;
  const secure = port === 465;
  return {
    host,
    port,
    secure,
    user,
    pass,
    from: process.env.SMTP_FROM?.trim() || user,
    to: process.env.SMTP_TO?.trim() || profile.email,
  };
}

async function getTransport(): Promise<{ transport: Transporter; config: SmtpConfig } | null> {
  const config = readConfig();
  if (!config) return null;
  // Reuse the same transport if the config hasn't changed.
  if (cachedTransport && cachedConfig && JSON.stringify(cachedConfig) === JSON.stringify(config)) {
    return { transport: cachedTransport, config };
  }
  // Cache miss — create a new transporter.
  const nodemailer = await import("nodemailer");
  cachedTransport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });
  cachedConfig = config;
  return { transport: cachedTransport, config };
}

/** Returns true if SMTP env vars are set and email forwarding is active. */
export function isEmailForwardingConfigured(): boolean {
  return readConfig() !== null;
}

export interface ContactMessageEmail {
  name: string;
  email: string;
  message: string;
  ticket: string;
}

/**
 * Send a contact-form message to David's inbox.
 * Returns true if sent (or queued by the SMTP server), false on error.
 * Caller should not throw — we don't want to break the contact form
 * submission flow if email forwarding fails. The DB row is the source
 * of truth.
 */
export async function forwardContactMessage(msg: ContactMessageEmail): Promise<boolean> {
  const transport = await getTransport();
  if (!transport) return false;
  const { transport: tr, config } = transport;
  const subject = `[Portfolio] Nuevo mensaje de ${msg.name} · ${msg.ticket}`;
  const text = [
    `Nuevo mensaje desde el formulario de contacto del portfolio.`,
    ``,
    `Nombre:  ${msg.name}`,
    `Email:   ${msg.email}`,
    `Ticket:  ${msg.ticket}`,
    `Recibido: ${new Date().toISOString()}`,
    ``,
    `--- Mensaje ---`,
    msg.message,
    `--- Fin del mensaje ---`,
    ``,
    `Respóndele directamente desde tu cliente de email a ${msg.email}.`,
    ``,
    `— Generado automáticamente por deividtech.cloud`,
  ].join("\n");
  const html = `
    <div style="font-family:system-ui,sans-serif;background:#0a0a0a;color:#f5f5f5;padding:24px;border-radius:12px;max-width:560px">
      <h2 style="margin:0 0 8px;color:#fff">Nuevo mensaje del portfolio</h2>
      <p style="margin:0 0 16px;color:#999">${msg.ticket} · ${new Date().toISOString()}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#ddd">
        <tr><td style="padding:4px 0;color:#888">Nombre</td><td style="padding:4px 0">${escapeHtml(msg.name)}</td></tr>
        <tr><td style="padding:4px 0;color:#888">Email</td><td style="padding:4px 0"><a href="mailto:${encodeURIComponent(msg.email)}" style="color:#6ea8fe">${escapeHtml(msg.email)}</a></td></tr>
      </table>
      <hr style="border:0;border-top:1px solid #222;margin:16px 0" />
      <pre style="white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;line-height:1.5;color:#eee;background:#16171c;padding:12px;border-radius:8px;margin:0">${escapeHtml(msg.message)}</pre>
      <p style="margin:16px 0 0;color:#888;font-size:12px">Respóndele desde tu cliente de email a ${escapeHtml(msg.email)}.</p>
    </div>
  `;
  try {
    await tr.sendMail({
      from: config.from,
      to: config.to,
      replyTo: msg.email,
      subject,
      text,
      html,
    });
    return true;
  } catch (err) {
    console.error("[email] contact forward failed:", err);
    return false;
  }
}

export interface SubscriberEmail {
  email: string;
}

/**
 * Notify David when a new subscriber joins the newsletter.
 * Returns true if sent, false on error or when email forwarding is off.
 */
export async function forwardSubscriberNotification(sub: SubscriberEmail): Promise<boolean> {
  const transport = await getTransport();
  if (!transport) return false;
  const { transport: tr, config } = transport;
  const subject = `[Portfolio] Nuevo suscriptor al newsletter · ${sub.email}`;
  const text = [
    `Tenés un nuevo suscriptor al newsletter.`,
    ``,
    `Email: ${sub.email}`,
    `Fecha: ${new Date().toISOString()}`,
    ``,
    `El listado completo de suscriptores está en /admin → Subscribers.`,
  ].join("\n");
  const html = `
    <div style="font-family:system-ui,sans-serif;background:#0a0a0a;color:#f5f5f5;padding:24px;border-radius:12px;max-width:480px">
      <h2 style="margin:0 0 8px;color:#fff">Nuevo suscriptor 📨</h2>
      <p style="margin:0 0 16px;color:#999">${new Date().toISOString()}</p>
      <p style="font-size:14px;color:#ddd">Se suscribió al newsletter:</p>
      <p style="font-size:16px;color:#fff;margin:8px 0 16px"><a href="mailto:${encodeURIComponent(sub.email)}" style="color:#6ea8fe">${escapeHtml(sub.email)}</a></p>
      <p style="margin:0;color:#888;font-size:12px">Listado completo en /admin → Subscribers.</p>
    </div>
  `;
  try {
    await tr.sendMail({
      from: config.from,
      to: config.to,
      subject,
      text,
      html,
    });
    return true;
  } catch (err) {
    console.error("[email] subscriber notification failed:", err);
    return false;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
