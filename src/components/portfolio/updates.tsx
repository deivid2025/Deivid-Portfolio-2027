"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  AlertTriangle,
  ArrowRight,
  Clock,
  ArrowUpRight,
  Newspaper,
  Share2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useI18n } from "@/components/portfolio/i18n-provider";
import { cn } from "@/lib/utils";
import { updates as allUpdates, type UpdatePost } from "@/lib/content";

type UpdatesResponse = {
  count: number;
  updates: UpdatePost[];
};

const CATEGORY_META: Record<
  UpdatePost["category"],
  { label: string; className: string }
> = {
  release: {
    label: "Release",
    className: "bg-foreground/10 text-foreground border-foreground/20",
  },
  devlog: {
    label: "Devlog",
    className: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
  },
  "case-study": {
    label: "Caso de estudio",
    className: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
  },
  announcement: {
    label: "Anuncio",
    className: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
  },
};

async function fetchUpdates(): Promise<UpdatePost[]> {
  try {
    const res = await fetch("/api/updates", { cache: "no-store" });
    if (!res.ok) throw new Error("API error");
    const data = (await res.json()) as UpdatesResponse;
    return data.updates ?? allUpdates;
  } catch {
    return allUpdates;
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function Updates() {
  const [selected, setSelected] = React.useState<UpdatePost | null>(null);
  const [search, setSearch] = React.useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["updates"],
    queryFn: fetchUpdates,
    staleTime: 60_000,
  });

  const posts = data ?? [];
  const filtered = React.useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [posts, search]);

  // Listen for "open-update" events from related-update buttons in the modal.
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<UpdatePost>).detail;
      if (detail) setSelected(detail);
    };
    window.addEventListener("open-update", handler);
    return () => window.removeEventListener("open-update", handler);
  }, []);

  const { t } = useI18n();
  const CATEGORY_META: Record<
    UpdatePost["category"],
    { label: string; className: string }
  > = {
    release: {
      label: t.updates.categories.release,
      className: "bg-foreground/10 text-foreground border-foreground/20",
    },
    devlog: {
      label: t.updates.categories.devlog,
      className: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
    },
    "case-study": {
      label: t.updates.categories["case-study"],
      className: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
    },
    announcement: {
      label: t.updates.categories.announcement,
      className: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
    },
  };

  return (
    <section id="blog" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Newspaper className="h-3.5 w-3.5 text-primary" />
              {t.updates.badge}
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {t.updates.title}
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {t.updates.subtitle}
            </p>
          </div>
          {!isLoading && !isError && posts.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar en blog..."
                className="h-9 w-full rounded-full border border-border/60 bg-card/40 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
              />
            </div>
          )}
        </motion.div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/40 p-5"
              >
                <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
                <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {t.updates.loading}
                </div>
              </div>
            ))}

          {!isLoading && isError && (
            <div className="col-span-full flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground">
                {t.projects.error}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="h-9 rounded-full"
              >
                {t.projects.retry}
              </Button>
            </div>
          )}

          {!isLoading &&
            !isError &&
            filtered.map((p, i) => (
              <motion.button
                key={p.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                onClick={() => setSelected(p)}
                className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-5 text-left backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "border font-mono text-[10px]",
                      CATEGORY_META[p.category].className,
                    )}
                  >
                    {CATEGORY_META[p.category].label}
                  </Badge>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {formatDate(p.date)}
                  </span>
                </div>

                <h3 className="text-base font-semibold leading-snug transition-colors group-hover:text-primary">
                  {p.title}
                </h3>
                <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {p.excerpt}
                </p>

                <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {t.updates.readTime(p.readTime)}
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-primary transition-transform group-hover:translate-x-0.5">
                    {t.updates.read}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>

                {p.project && (
                  <span className="absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-primary/60" />
                )}
              </motion.button>
            ))}

          {!isLoading && !isError && filtered.length === 0 && search && (
            <div className="col-span-full rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
              No hay posts que coincidan con “{search}”. Probá con otra búsqueda.
            </div>
          )}
        </div>
      </div>

      <UpdateModal post={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

// Listen for "open-update" custom events dispatched from related-update buttons
// inside the modal, so clicking a related post swaps the modal content.
// (Hooked into the Updates component via a useEffect in the function body above.)

function UpdateModal({
  post,
  onClose,
}: {
  post: UpdatePost | null;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const CATEGORY_META: Record<
    UpdatePost["category"],
    { label: string; className: string }
  > = {
    release: {
      label: t.updates.categories.release,
      className: "bg-foreground/10 text-foreground border-foreground/20",
    },
    devlog: {
      label: t.updates.categories.devlog,
      className: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
    },
    "case-study": {
      label: t.updates.categories["case-study"],
      className: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
    },
    announcement: {
      label: t.updates.categories.announcement,
      className: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
    },
  };
  return (
    <Dialog
      open={!!post}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-2xl gap-0 overflow-hidden p-0">
        <AnimatePresence>
          {post && (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Banner */}
              <div className="relative h-24 overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
                <div className="absolute inset-0 bg-grid opacity-25 mix-blend-overlay" />
                <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "border bg-background/70 font-mono text-[10px] backdrop-blur",
                      CATEGORY_META[post.category].className,
                    )}
                  >
                    {CATEGORY_META[post.category].label}
                  </Badge>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {formatDate(post.date)} · {post.readTime} min
                  </span>
                </div>
              </div>

              <DialogHeader className="px-5 pt-4 sm:px-6">
                <DialogTitle className="text-balance text-xl font-bold leading-snug sm:text-2xl">
                  {post.title}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {post.excerpt}
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden px-5 pb-4 sm:px-6 scrollbar-thin">
                <div className="space-y-4 py-4">
                  {post.body.map((para, idx) => (
                    <p
                      key={idx}
                      className="text-sm leading-relaxed text-foreground/90"
                    >
                      {para}
                    </p>
                  ))}

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {post.tags.map((tg) => (
                      <span
                        key={tg}
                        className="rounded-md border border-border/60 bg-background/60 px-2 py-1 font-mono text-[11px] text-muted-foreground"
                      >
                        #{tg}
                      </span>
                    ))}
                  </div>

                  {/* Related updates */}
                  {(() => {
                    const related = allUpdates
                      .filter(
                        (u) =>
                          u.slug !== post.slug &&
                          (u.project === post.project ||
                            u.tags.some((tag) => post.tags.includes(tag))),
                      )
                      .slice(0, 3);
                    if (related.length === 0) return null;
                    return (
                      <div className="border-t border-border/40 pt-4">
                        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Posts relacionados
                        </div>
                        <div className="space-y-2">
                          {related.map((r) => (
                            <button
                              key={r.slug}
                              onClick={() => {
                                // swap the modal content to the related post
                                const event = new CustomEvent("open-update", {
                                  detail: r,
                                });
                                window.dispatchEvent(event);
                              }}
                              className="flex w-full items-center gap-3 rounded-lg border border-border/60 bg-background/60 p-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40"
                            >
                              <Badge
                                variant="outline"
                                className="shrink-0 font-mono text-[9px]"
                              >
                                {r.category}
                              </Badge>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-xs font-medium">
                                  {r.title}
                                </div>
                                <div className="font-mono text-[10px] text-muted-foreground">
                                  {formatDate(r.date)}
                                </div>
                              </div>
                              <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 overflow-hidden border-t border-border/60 bg-card/40 px-3 py-3 sm:px-6">
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  {post.project
                    ? `${t.updates.about}: ${post.project}`
                    : t.updates.about}
                </span>
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-full text-xs sm:h-9 sm:text-sm"
                    onClick={async () => {
                      try {
                        const url = window.location.href.split("?")[0] + `?update=${post.slug}#blog`;
                        await navigator.clipboard.writeText(url);
                        toast.success("Link del post copiado");
                      } catch {
                        toast.error("No pude copiar el link");
                      }
                    }}
                  >
                    <Share2 className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
                    Compartir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full text-xs sm:h-9 sm:text-sm"
                    onClick={onClose}
                  >
                    {t.updates.close}
                    <ArrowUpRight className="ml-1 h-3 w-3 sm:ml-1 sm:h-3.5 sm:w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
