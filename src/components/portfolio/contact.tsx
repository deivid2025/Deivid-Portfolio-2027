"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Send,
  Loader2,
  CheckCircle2,
  MessageSquare,
  Mail,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { profile } from "@/lib/projects";
import { useI18n } from "@/components/portfolio/i18n-provider";

interface ContactResponse {
  ok?: boolean;
  error?: string;
  ticket?: string;
}

export function Contact() {
  const { t } = useI18n();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = (await res.json()) as ContactResponse;
      if (!res.ok || data.error) {
        toast.error(data.error ?? t.contact.error);
        return;
      }
      setDone(data.ticket ?? "OK");
      toast.success(t.contact.success);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      toast.error(t.contact.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contact" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/50 p-6 backdrop-blur sm:p-10">
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-foreground/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground" />
                {t.contact.badge}
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                {t.contact.title}
              </h2>
              <p className="mt-3 text-muted-foreground">{t.contact.subtitle}</p>

              <div className="mt-6 space-y-2 text-sm">
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  Escribíme
                </a>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  {t.contact.responseTime}
                </div>
              </div>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onSubmit={onSubmit}
              className="space-y-4"
            >
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                value=""
                onChange={() => {}}
                aria-hidden
              />

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">
                  {t.contact.name}
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.contact.namePlaceholder}
                    className="h-11 rounded-xl pl-9"
                    required
                    minLength={2}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">
                  {t.contact.email}
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.contact.emailPlaceholder}
                    className="h-11 rounded-xl pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-xs">
                  {t.contact.message}
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.contact.messagePlaceholder}
                  className="min-h-[120px] rounded-xl resize-none"
                  required
                  minLength={10}
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !!done}
                className="h-11 w-full rounded-xl text-sm"
              >
                {done ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {t.contact.sent} · {done}
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.contact.sending}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {t.contact.send}
                  </>
                )}
              </Button>

              {done && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 w-full rounded-xl text-xs"
                  onClick={() => setDone(null)}
                >
                  {t.contact.sendAnother}
                </Button>
              )}
            </motion.form>
          </div>
        </div>
      </div>
    </section>
  );
}
