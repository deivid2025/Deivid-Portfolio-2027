"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Mail, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        duplicate?: boolean;
      };
      if (!res.ok || data.error) {
        toast.error(data.error ?? "No te pude suscribir.");
        return;
      }
      setDone(true);
      toast.success(
        data.duplicate
          ? "Ya estabas suscripto, ¡gracias por volver!"
          : "¡Suscripto! Te aviso cuando publique algo nuevo.",
      );
      setEmail("");
    } catch {
      toast.error("Algo salió mal. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur"
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/15 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Mail className="h-4 w-4 text-primary" />
          Newsletter
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Novedades, releases y devlogs. Sin spam, 1 email por mes.
        </p>
        {done ? (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            ¡Suscripto! Gracias.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-3 flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="h-9 min-w-0 flex-1 rounded-lg text-sm"
            />
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="h-9 shrink-0 rounded-lg px-3"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5" />
              )}
            </Button>
          </form>
        )}
      </div>
    </motion.div>
  );
}
