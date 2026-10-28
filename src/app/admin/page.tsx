"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Mail,
  Trash2,
  Eye,
  TrendingUp,
  MessageSquare,
  FileText,
  Star,
  Loader2,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Plus,
  Pencil,
  Inbox,
  Newspaper,
  Sparkles,
  Briefcase,
  Download,
  Globe,
  Smartphone,
  Monitor,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { QueryProvider } from "@/components/portfolio/query-provider";
import {
  UpdateFormDialog,
  type UpdateRow,
} from "@/components/portfolio/admin-update-form";
import {
  TestimonialFormDialog,
  type TestimonialRow,
} from "@/components/portfolio/admin-testimonial-form";
import {
  ProjectFormDialog,
  type ProjectAdminRow,
} from "@/components/portfolio/admin-project-form";
import { AnalyticsChart } from "@/components/portfolio/analytics-chart";
import { Trash2 as TrashIcon, Database } from "lucide-react";

// --- ViewEvent cleanup state ---
async function fetchEventStats(): Promise<{ totalEvents: number; oldestEvent: string | null }> {
  const res = await fetch("/api/admin/cleanup", { cache: "no-store" });
  if (!res.ok) throw new Error("No autorizado");
  return res.json();
}

async function runCleanup(retentionDays: number): Promise<{ cleaned: number; buckets: unknown[] }> {
  const res = await fetch("/api/admin/cleanup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ retentionDays }),
  });
  if (!res.ok) throw new Error("No se pudo limpiar");
  return res.json();
}

function CleanupCard() {
  const qc = useQueryClient();
  const { data: eventStats } = useQuery({
    queryKey: ["admin-event-stats"],
    queryFn: fetchEventStats,
    staleTime: 60_000,
    retry: 0,
  });
  const cleanup = useMutation({
    mutationFn: () => runCleanup(90),
    onSuccess: (d) => {
      toast.success(`${d.cleaned} eventos agregados y limpiados.`);
      qc.invalidateQueries({ queryKey: ["admin-event-stats"] });
      qc.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Card className="overflow-hidden border-border/60 bg-card/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Database className="h-4 w-4 text-primary" />
            ViewEvent log
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {eventStats?.totalEvents ?? "…"} filas
          </Badge>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          La tabla de eventos de vista crece una fila por apertura de modal.
          Agregá eventos &gt;90 días en buckets diarios y borrá los raw para
          mantener la DB liviana.
        </p>
        {eventStats?.oldestEvent && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            Evento más viejo:{" "}
            {new Date(eventStats.oldestEvent).toLocaleDateString("es-AR")}
          </p>
        )}
        <Button
          size="sm"
          variant="outline"
          className="mt-3 h-8 w-full rounded-lg text-xs"
          disabled={cleanup.isPending}
          onClick={() => cleanup.mutate()}
        >
          {cleanup.isPending ? (
            <>
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              Limpiando…
            </>
          ) : (
            <>
              <TrashIcon className="mr-1.5 h-3 w-3" />
              Agregar + limpiar (&gt;90 días)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// --- Types ---
interface StatsData {
  counts: {
    messages: number;
    updates: number;
    testimonials: number;
    projects: number;
    totalViews: number;
    subscribers: number;
  };
  recentMessages: Array<{
    id: string;
    name: string;
    email: string;
    ticket: string;
    createdAt: string;
  }>;
  projectViews: Array<{ slug: string; views: number }>;
  emailForwarding?: {
    configured: boolean;
    destination: string;
  };
}

interface MessageItem {
  id: string;
  name: string;
  email: string;
  message: string;
  ticket: string;
  createdAt: string;
}

// --- Auth + fetchers ---
async function checkAuth(): Promise<boolean> {
  const res = await fetch("/api/auth/me", { cache: "no-store" });
  if (!res.ok) return false;
  const data = (await res.json()) as { authenticated?: boolean };
  return !!data.authenticated;
}

async function doLogin(password: string): Promise<boolean> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return res.ok;
}

async function doLogout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

async function fetchStats(): Promise<StatsData> {
  const res = await fetch("/api/admin/stats", { cache: "no-store" });
  if (!res.ok) throw new Error("No autorizado");
  return res.json();
}

async function fetchMessages(): Promise<MessageItem[]> {
  const res = await fetch("/api/admin/messages", { cache: "no-store" });
  if (!res.ok) throw new Error("No autorizado");
  const data = (await res.json()) as { messages: MessageItem[] };
  return data.messages;
}

async function deleteMessage(id: string): Promise<void> {
  const res = await fetch("/api/admin/messages", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("No se pudo borrar");
}

async function fetchUpdatesAdmin(): Promise<UpdateRow[]> {
  const res = await fetch("/api/admin/updates", { cache: "no-store" });
  if (!res.ok) throw new Error("No autorizado");
  const data = (await res.json()) as { updates: UpdateRow[] };
  return data.updates.map((u) => ({
    ...u,
    body: u.body, // already newline-separated string in DB
  }));
}

async function deleteUpdate(slug: string): Promise<void> {
  const res = await fetch(`/api/admin/updates/${slug}`, { method: "DELETE" });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error ?? "No se pudo borrar");
  }
}

async function fetchTestimonialsAdmin(): Promise<TestimonialRow[]> {
  const res = await fetch("/api/admin/testimonials", { cache: "no-store" });
  if (!res.ok) throw new Error("No autorizado");
  const data = (await res.json()) as { testimonials: TestimonialRow[] };
  return data.testimonials;
}

async function deleteTestimonial(id: string): Promise<void> {
  const res = await fetch(`/api/admin/testimonials/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error ?? "No se pudo borrar");
  }
}

// --- Page shell ---
// The middleware in src/middleware.ts blocks unauthed requests to /admin
// and redirects them to /admin/login. So if we reach here, the user is
// already authenticated (the cookie has been verified server-side).
export default function AdminPage() {
  return (
    <QueryProvider>
      <AdminDashboard
        onLogout={async () => {
          await doLogout();
          // Hard redirect to the login page so the middleware re-evaluates.
          window.location.href = "/admin/login";
        }}
      />
    </QueryProvider>
  );
}

// --- Dashboard ---
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="font-mono text-sm font-semibold">
                deivid<span className="text-primary">.tech</span> /admin
              </div>
              <div className="text-[11px] text-muted-foreground">
                Panel de control
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="h-9 rounded-full">
              <Link href="/">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Ver sitio
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-full"
              onClick={onLogout}
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <EmailForwardingBanner />
        <StatsRow />

        <Tabs defaultValue="messages" className="mt-6">
          <TabsList className="grid w-full grid-cols-5 sm:w-auto sm:inline-flex">
            <TabsTrigger value="messages" className="gap-1.5">
              <Inbox className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mensajes</span>
              <span className="sm:hidden">Msjs</span>
            </TabsTrigger>
            <TabsTrigger value="updates" className="gap-1.5">
              <Newspaper className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Updates</span>
              <span className="sm:hidden">BLOG</span>
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Testimonios</span>
              <span className="sm:hidden">Tst</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Proyectos</span>
              <span className="sm:hidden">Prj</span>
            </TabsTrigger>
            <TabsTrigger value="visitors" className="gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Visitantes</span>
              <span className="sm:hidden">Vis</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="mt-4">
            <MessagesTab />
          </TabsContent>
          <TabsContent value="updates" className="mt-4">
            <UpdatesTab />
          </TabsContent>
          <TabsContent value="testimonials" className="mt-4">
            <TestimonialsTab />
          </TabsContent>
          <TabsContent value="projects" className="mt-4">
            <ProjectsTab />
          </TabsContent>
          <TabsContent value="visitors" className="mt-4">
            <VisitorsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// --- Stats row (count cards + analytics chart) ---
function StatsRow() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchStats,
    staleTime: 30_000,
    retry: 0,
  });

  const cards = [
    {
      label: "Mensajes",
      value: stats?.counts.messages ?? 0,
      icon: MessageSquare,
      accent: "from-amber-500 to-orange-600",
    },
    {
      label: "Vistas totales",
      value: stats?.counts.totalViews ?? 0,
      icon: Eye,
      accent: "from-emerald-500 to-teal-600",
    },
    {
      label: "Updates (blog)",
      value: stats?.counts.updates ?? 0,
      icon: FileText,
      accent: "from-violet-500 to-purple-600",
    },
    {
      label: "Testimonios",
      value: stats?.counts.testimonials ?? 0,
      icon: Star,
      accent: "from-rose-500 to-red-600",
    },
    {
      label: "Subscribers",
      value: stats?.counts.subscribers ?? 0,
      icon: Mail,
      accent: "from-cyan-500 to-blue-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className="relative overflow-hidden border-border/60 bg-card/50">
                <div
                  className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${c.accent} opacity-20 blur-2xl`}
                />
                <CardContent className="relative p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">{c.label}</div>
                    <div
                      className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${c.accent} text-white`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-2 font-mono text-3xl font-bold">
                    {isLoading ? "…" : c.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="overflow-hidden border-border/60 bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-primary" />
              Actividad de los últimos 30 días
            </div>
            <div className="mt-4">
              <AnalyticsChart />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {stats && stats.projectViews.length > 0 && (
          <Card className="overflow-hidden border-border/60 bg-card/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Eye className="h-4 w-4 text-primary" />
                Vistas por proyecto
              </div>
              <div className="mt-4 space-y-3">
                {[...stats.projectViews]
                  .sort((a, b) => b.views - a.views)
                  .map((p) => {
                    const max = Math.max(
                      ...stats.projectViews.map((v) => v.views),
                    );
                    const pct = max > 0 ? (p.views / max) * 100 : 0;
                    return (
                      <div key={p.slug} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-muted-foreground">
                            {p.slug}
                          </span>
                          <span className="font-mono font-semibold">
                            {p.views}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500"
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
          )}
          <CleanupCard />
        </div>
      </div>
    </div>
  );
}

// --- Tab: Messages (existing) ---
function MessagesTab() {
  const qc = useQueryClient();
  const { data: messages, isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: fetchMessages,
    staleTime: 10_000,
    retry: 0,
  });
  const del = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-messages"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card className="overflow-hidden border-border/60 bg-card/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Mail className="h-4 w-4 text-primary" />
            Bandeja de mensajes
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{messages?.length ?? 0} total</Badge>
            <a
              href="/api/admin/export?dataset=messages"
              className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Download className="h-3 w-3" />
              CSV
            </a>
          </div>
        </div>

        <ScrollArea className="mt-4 max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando mensajes…
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No hay mensajes todavía.
            </div>
          ) : (
            <div className="space-y-3 pr-2">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border/60 bg-background/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{m.name}</span>
                        <a
                          href={`mailto:${m.email}`}
                          className="text-xs text-primary hover:underline"
                        >
                          {m.email}
                        </a>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {m.ticket}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(m.createdAt).toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                        {m.message}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Borrar mensaje"
                      disabled={del.isPending}
                      onClick={() => del.mutate(m.id)}
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// --- Tab: Updates (CRUD) ---
function UpdatesTab() {
  const qc = useQueryClient();
  const { data: updates, isLoading } = useQuery({
    queryKey: ["admin-updates"],
    queryFn: fetchUpdatesAdmin,
    staleTime: 10_000,
    retry: 0,
  });
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<UpdateRow | null>(null);
  const del = useMutation({
    mutationFn: deleteUpdate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-updates"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Update borrado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card className="overflow-hidden border-border/60 bg-card/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Newspaper className="h-4 w-4 text-primary" />
            Posts del blog / devlog
          </div>
          <Button
            size="sm"
            className="h-9 rounded-full"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nuevo
          </Button>
        </div>

        <ScrollArea className="mt-4 max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando updates…
            </div>
          ) : !updates || updates.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No hay updates todavía. Creá el primero con el botón “Nuevo”.
            </div>
          ) : (
            <div className="space-y-3 pr-2">
              {updates.map((u) => (
                <motion.div
                  key={u.slug}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border/60 bg-background/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] capitalize"
                        >
                          {u.category}
                        </Badge>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {u.date}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          · {u.readTime} min
                        </span>
                        {u.project && (
                          <span className="text-[11px] text-primary">
                            {u.project}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                        {u.slug}
                      </div>
                      <div className="mt-1 font-semibold">{u.title}</div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {u.excerpt}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Editar"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => {
                          setEditing(u);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Borrar"
                        disabled={del.isPending}
                        onClick={() => del.mutate(u.slug)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <UpdateFormDialog
        open={formOpen}
        initial={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
      />
    </Card>
  );
}

// --- Tab: Testimonials (CRUD) ---
function TestimonialsTab() {
  const qc = useQueryClient();
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: fetchTestimonialsAdmin,
    staleTime: 10_000,
    retry: 0,
  });
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TestimonialRow | null>(null);
  const del = useMutation({
    mutationFn: deleteTestimonial,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Testimonio borrado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card className="overflow-hidden border-border/60 bg-card/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            Testimonios
          </div>
          <Button
            size="sm"
            className="h-9 rounded-full"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nuevo
          </Button>
        </div>

        <ScrollArea className="mt-4 max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando testimonios…
            </div>
          ) : !testimonials || testimonials.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No hay testimonios todavía.
            </div>
          ) : (
            <div className="space-y-3 pr-2">
              {testimonials.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border/60 bg-background/60 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${t.accent}`}
                    >
                      {t.avatarInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{t.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {t.role} · {t.company}
                        </span>
                        {t.project && (
                          <span className="text-[11px] text-primary">
                            · {t.project}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        “{t.quote}”
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Editar"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => {
                          setEditing(t);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Borrar"
                        disabled={del.isPending}
                        onClick={() => del.mutate(t.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <TestimonialFormDialog
        open={formOpen}
        initial={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
      />
    </Card>
  );
}

// --- Tab: Projects (CRUD) ---
async function fetchProjectsAdmin(): Promise<ProjectAdminRow[]> {
  const res = await fetch("/api/admin/projects", { cache: "no-store" });
  if (!res.ok) throw new Error("No autorizado");
  const data = (await res.json()) as { projects: ProjectAdminRow[] };
  return data.projects;
}

async function deleteProject(slug: string): Promise<void> {
  const res = await fetch(`/api/admin/projects/${slug}`, { method: "DELETE" });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error ?? "No se pudo borrar");
  }
}

function ProjectsTab() {
  const qc = useQueryClient();
  const { data: projects, isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: fetchProjectsAdmin,
    staleTime: 10_000,
    retry: 0,
  });
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProjectAdminRow | null>(null);
  const del = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Proyecto borrado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card className="overflow-hidden border-border/60 bg-card/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Briefcase className="h-4 w-4 text-primary" />
            Proyectos del portfolio
          </div>
          <Button
            size="sm"
            className="h-9 rounded-full"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nuevo
          </Button>
        </div>

        <ScrollArea className="mt-4 max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando proyectos…
            </div>
          ) : !projects || projects.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No hay proyectos todavía.
            </div>
          ) : (
            <div className="space-y-3 pr-2">
              {projects.map((p) => (
                <motion.div
                  key={p.slug}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border/60 bg-background/60 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br ${p.accent}`}
                    >
                      {p.screenshot ? (
                        <img
                          src={p.screenshot}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Briefcase className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            p.status === "live"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                              : p.status === "beta"
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                                : ""
                          }
                        >
                          {p.status}
                        </Badge>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {p.year} · {p.category}
                        </span>
                      </div>
                      <div className="mt-1 font-semibold">{p.name}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {p.slug}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-1">
                        {p.tagline}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Editar"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => {
                          setEditing(p);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Borrar"
                        disabled={del.isPending}
                        onClick={() => del.mutate(p.slug)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <ProjectFormDialog
        open={formOpen}
        initial={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
      />
    </Card>
  );
}

// --- Visitors tab: top countries + devices ---
interface VisitorStats {
  totals: {
    totalVisits: number;
    uniqueVisitors: number;
    visits24h: number;
    visits7d: number;
    unique24h: number;
    unique7d: number;
  };
  topCountries: Array<{ country: string; countryName: string; visits: number; unique: number }>;
  topDevices: Array<{ deviceType: string; visits: number; unique: number }>;
  topOs: Array<{ os: string; visits: number; unique: number }>;
  topBrowsers: Array<{ browser: string; visits: number; unique: number }>;
}

async function fetchVisitorStats(): Promise<VisitorStats> {
  const res = await fetch("/api/visitors/stats", { cache: "no-store" });
  if (!res.ok) throw new Error("No autorizado");
  return res.json();
}

// Convert ISO 3166-1 alpha-2 country code to flag emoji.
function countryFlag(code: string): string {
  if (!code || code === "Unknown" || code === "LO") return "🌐";
  const base = 0x1f1e6;
  const chars = code.toUpperCase().split("");
  if (chars.length !== 2 || !/^[A-Z]+$/.test(chars.join(""))) return "🌐";
  return String.fromCodePoint(base + chars[0].charCodeAt(0) - 65) +
         String.fromCodePoint(base + chars[1].charCodeAt(0) - 65);
}

// Pick an icon for the device type.
function deviceIcon(deviceType: string) {
  if (deviceType === "mobile") return Smartphone;
  if (deviceType === "tablet") return Smartphone;
  if (deviceType === "bot") return Globe;
  return Monitor;
}

function VisitorsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["visitor-stats"],
    queryFn: fetchVisitorStats,
    staleTime: 30_000,
    retry: 0,
  });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="border-border/60 bg-card/50">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          No se pudieron cargar las estadísticas de visitantes.
        </CardContent>
      </Card>
    );
  }

  const totals = [
    {
      label: "Visitas totales",
      value: data.totals.totalVisits,
      sub: `${data.totals.uniqueVisitors} únicos`,
      icon: Eye,
    },
    {
      label: "Últimas 24h",
      value: data.totals.visits24h,
      sub: `${data.totals.unique24h} únicos`,
      icon: TrendingUp,
    },
    {
      label: "Últimos 7 días",
      value: data.totals.visits7d,
      sub: `${data.totals.unique7d} únicos`,
      icon: Users,
    },
    {
      label: "Países",
      value: data.topCountries.length,
      sub: "distintos",
      icon: Globe,
    },
  ];

  const renderBarList = (
    items: Array<{ label: string; sub?: string; value: number }>,
    total: number,
    icon?: React.ComponentType<{ className?: string }>,
    accent: string = "from-primary to-primary/60",
  ) => {
    const max = Math.max(...items.map((i) => i.value), 1);
    return (
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
            Sin datos todavía.
          </div>
        )}
        {items.map((it, i) => {
          const pct = (it.value / max) * 100;
          const sharePct = total > 0 ? (it.value / total) * 100 : 0;
          const Icon = icon;
          return (
            <div key={`${it.label}-${i}`} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                  {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                  <span className="truncate font-medium text-foreground">
                    {it.label}
                  </span>
                  {it.sub && (
                    <span className="shrink-0 text-muted-foreground">
                      · {it.sub}
                    </span>
                  )}
                </span>
                <span className="shrink-0 font-mono font-semibold text-foreground">
                  {it.value}{" "}
                  <span className="text-muted-foreground">
                    ({sharePct.toFixed(1)}%)
                  </span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.04 }}
                  className={`h-full rounded-full bg-gradient-to-r ${accent}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const totalCountryVisits = data.topCountries.reduce((a, c) => a + c.visits, 0);
  const totalDeviceVisits = data.topDevices.reduce((a, d) => a + d.visits, 0);
  const totalOsVisits = data.topOs.reduce((a, o) => a + o.visits, 0);
  const totalBrowserVisits = data.topBrowsers.reduce((a, b) => a + b.visits, 0);

  return (
    <div className="space-y-6">
      {/* Header row: title + CSV export for backups */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">Visitantes — país + dispositivo</div>
        <a
          href="/api/visitors/export"
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Descargar CSV</span>
          <span className="sm:hidden">CSV</span>
        </a>
      </div>
      {/* Totals */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {totals.map((t, i) => {
          const Icon = t.icon;
          return (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className="relative overflow-hidden border-border/60 bg-card/50">
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 opacity-50 blur-2xl" />
                <CardContent className="relative p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">{t.label}</div>
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-2 font-mono text-3xl font-bold">{t.value}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{t.sub}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top countries */}
        <Card className="overflow-hidden border-border/60 bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Globe className="h-4 w-4 text-primary" />
              Países con más visitas
            </div>
            <div className="mt-4">
              {renderBarList(
                data.topCountries.map((c) => ({
                  label: `${countryFlag(c.country)} ${c.countryName}`,
                  sub: `${c.unique} únicos`,
                  value: c.visits,
                })),
                totalCountryVisits,
                undefined,
                "from-emerald-500 to-teal-600",
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top devices */}
        <Card className="overflow-hidden border-border/60 bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Monitor className="h-4 w-4 text-primary" />
              Dispositivos
            </div>
            <div className="mt-4">
              {renderBarList(
                data.topDevices.map((d) => ({
                  label: d.deviceType === "Unknown" ? "Otro" : d.deviceType,
                  sub: `${d.unique} únicos`,
                  value: d.visits,
                })),
                totalDeviceVisits,
                undefined,
                "from-violet-500 to-purple-600",
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top OS */}
        <Card className="overflow-hidden border-border/60 bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Smartphone className="h-4 w-4 text-primary" />
              Sistemas operativos
            </div>
            <div className="mt-4">
              {renderBarList(
                data.topOs.map((o) => ({
                  label: o.os === "Unknown" ? "Otro" : o.os,
                  sub: `${o.unique} únicos`,
                  value: o.visits,
                })),
                totalOsVisits,
                undefined,
                "from-amber-500 to-orange-600",
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top browsers */}
        <Card className="overflow-hidden border-border/60 bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Eye className="h-4 w-4 text-primary" />
              Navegadores
            </div>
            <div className="mt-4">
              {renderBarList(
                data.topBrowsers.map((b) => ({
                  label: b.browser === "Unknown" ? "Otro" : b.browser,
                  sub: `${b.unique} únicos`,
                  value: b.visits,
                })),
                totalBrowserVisits,
                undefined,
                "from-cyan-500 to-blue-600",
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/30 p-4 text-xs text-muted-foreground">
        <ShieldCheck className="mr-1.5 inline h-3.5 w-3.5 text-primary" />
        Privacidad: la IP se hashea con sal diaria (SHA-256) — nunca se guarda
        la IP cruda. Solo se captura país, ciudad, dispositivo, OS y navegador.
      </div>
    </div>
  );
}

// --- Email forwarding banner ---
// Shows a small status banner above the stats row so David knows whether
// messages from the contact form + new-subscriber notifications are being
// emailed directly to his inbox (SMTP configured) or only persisted to the
// DB (visible in /admin but no email forwarding yet).
function EmailForwardingBanner() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchStats,
    staleTime: 30_000,
    retry: 0,
  });

  if (isLoading || !data?.emailForwarding) return null;

  const ef = data.emailForwarding;
  if (ef.configured) {
    return (
      <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-600 dark:text-emerald-400">
        <Mail className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium">Forwarding de email activo</span>
        <span className="text-emerald-600/70 dark:text-emerald-400/70">
          — los mensajes del formulario de contacto y los nuevos suscriptores
          se envían a <span className="font-mono">{ef.destination}</span>.
        </span>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
        <Mail className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium">
          Forwarding de email desactivado
        </span>
      </div>
      <p className="mt-1.5 text-amber-700/80 dark:text-amber-300/80">
        Los mensajes del formulario de contacto y los nuevos suscriptores
        se guardan en la DB y se ven en este panel, pero <strong>no te
        llegan por email</strong>. Para activar el forwarding, agregá estas
        variables de entorno en <span className="font-mono">.env</span>:
      </p>
      <pre className="mt-2 overflow-x-auto rounded-lg bg-amber-950/30 p-2.5 font-mono text-[10px] text-amber-200/90">
{`SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=tu-app-password  # NO la password regular
SMTP_FROM=Portfolio <tu-correo@gmail.com>  # opcional
SMTP_TO=davidgaray849@gmail.com  # opcional`}
      </pre>
      <p className="mt-2 text-[11px] text-amber-700/70 dark:text-amber-300/70">
        Para Gmail: creá una App Password en{" "}
        <a
          href="https://myaccount.google.com/apppasswords"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-amber-600 underline underline-offset-2 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300"
        >
          Cuentas de Google → App Passwords
        </a>
        . Otras opciones: Outlook (smtp.office365.com:587), ProtonMail Bridge,
        o cualquier SMTP propio.
      </p>
    </div>
  );
}
