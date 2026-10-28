"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        toast.error("Contraseña incorrecta");
        setLoading(false);
        return;
      }
      toast.success("Acceso concedido");
      // Force a hard navigation so the middleware re-evaluates with the
      // new cookie.
      window.location.href = next;
    } catch {
      toast.error("No pude conectar con el servidor");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al portfolio
        </Link>

        <div className="rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-mono text-sm font-semibold">deivid.tech</h1>
              <p className="text-xs text-muted-foreground">Acceso administrador</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="pwd" className="text-xs">Contraseña</Label>
              <Input
                id="pwd"
                type="password"
                autoComplete="current-password"
                autoFocus
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 h-11"
                placeholder="••••••••••••"
              />
            </div>
            <Button
              type="submit"
              className="h-11 w-full gap-1.5"
              disabled={loading || !password}
            >
              {loading ? "Verificando…" : "Entrar"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          🔒 Ruta protegida · token AES-GCM cifrado · httpOnly · SameSite=Strict
        </p>
      </div>
    </main>
  );
}
