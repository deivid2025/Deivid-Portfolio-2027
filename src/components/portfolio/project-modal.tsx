"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ExternalLink,
  Target,
  Wrench,
  ListChecks,
  BarChart3,
  CalendarDays,
  Tag,
  Share2,
  Check,
  Link2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DynamicIcon } from "@/components/portfolio/dynamic-icon";
import { ProjectViews } from "@/components/portfolio/project-views";
import { useI18n } from "@/components/portfolio/i18n-provider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { projects as allProjects, type Project } from "@/lib/projects";

const CATEGORY_COLORS: Record<string, string> = {
  frontend: "bg-primary/10 text-primary border-primary/30",
  backend: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  database: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  infra: "bg-rose-500/10 text-rose-500 border-rose-500/30",
  ai: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  tooling: "bg-muted text-muted-foreground border-border",
};

const CATEGORY_LABEL: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Base de datos",
  infra: "Infra",
  ai: "IA",
  tooling: "Tooling",
};

export function ProjectModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = React.useState(false);

  const relatedProjects = React.useMemo<Project[]>(() => {
    if (!project) return [];
    return allProjects
      .filter((p) => p.slug !== project.slug && p.category === project.category)
      .slice(0, 2);
  }, [project]);

  const shareUrl = React.useMemo(() => {
    if (!project) return "";
    if (typeof window === "undefined") return project.url;
    const u = new URL(window.location.href);
    u.searchParams.set("project", project.slug);
    u.hash = "#work";
    return u.toString();
  }, [project]);

  const handleCopyShare = React.useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(t.project.copySuccess);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error(t.project.copyError);
    }
  }, [shareUrl, t.project.copySuccess, t.project.copyError]);

  const STATUS_LABEL: Record<Project["status"], string> = {
    live: t.project.status.live,
    beta: t.project.status.beta,
    maintenance: t.project.status.maintenance,
  };

  const CATEGORY_LABEL_I18N: Record<string, string> = {
    frontend: t.stack.categories.frontend,
    backend: t.stack.categories.backend,
    database: t.stack.categories.database,
    infra: t.stack.categories.infra,
    ai: t.stack.categories.ai,
    tooling: t.stack.categories.tooling,
  };

  return (
    <Dialog
      open={!!project}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[92vh] max-w-3xl gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <AnimatePresence>
          {project && (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Cover banner — real screenshot */}
              <div className="relative h-40 overflow-hidden sm:h-48">
                <img
                  src={project.screenshot}
                  alt={`Portada de ${project.name}`}
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30" />
                <DynamicIcon
                  name={project.icon}
                  className="absolute -right-4 -top-4 h-44 w-44 text-white/15"
                />
                <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-widest text-white/70">
                      {project.category} · {project.year}
                    </div>
                    <DialogTitle className="mt-1 text-2xl font-bold text-white drop-shadow-sm sm:text-3xl">
                      {project.name}
                    </DialogTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white backdrop-blur"
                  >
                    {STATUS_LABEL[project.status]}
                  </Badge>
                </div>
              </div>

              <DialogHeader className="px-5 pt-4 sm:px-6">
                <DialogDescription className="text-sm font-medium text-foreground/90">
                  {project.tagline}
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden px-5 pb-4 sm:px-6 scrollbar-thin">
                <div className="space-y-6 py-4">
                  {/* Quick facts */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <QuickFact
                      icon={CalendarDays}
                      label={t.project.year}
                      value={project.year}
                    />
                    <QuickFact
                      icon={Tag}
                      label={t.project.category}
                      value={project.category}
                    />
                    <QuickFact
                      icon={Target}
                      label={t.project.state}
                      value={STATUS_LABEL[project.status]}
                    />
                    <QuickFact
                      icon={ExternalLink}
                      label="URL"
                      value={project.url.replace(/^https?:\/\//, "")}
                      href={project.url}
                    />
                  </div>

                  <Separator />

                  {/* Long description */}
                  <section>
                    <SectionTitle
                      icon={ListChecks}
                      title={t.project.description}
                    />
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {project.longDescription}
                    </p>
                  </section>

                  {/* Features */}
                  <section>
                    <SectionTitle icon={ListChecks} title={t.project.features} />
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {project.features.map((f) => (
                        <div
                          key={f.title}
                          className="rounded-xl border border-border/60 bg-card/50 p-3"
                        >
                          <div className="text-sm font-semibold text-foreground">
                            {f.title}
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {f.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Metrics */}
                  <section>
                    <SectionTitle icon={BarChart3} title={t.project.metrics} />
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {project.metrics.map((m) => (
                        <div
                          key={m.label}
                          className="rounded-xl border border-border/60 bg-card/50 p-3 text-center"
                        >
                          <div className="font-mono text-lg font-bold text-primary">
                            {m.value}
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {m.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Tech stack */}
                  <section>
                    <SectionTitle icon={Wrench} title={t.project.stack} />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.techStack.map((tch) => (
                        <Badge
                          key={tch.name}
                          variant="outline"
                          className={cn(
                            "border font-mono text-[11px]",
                            CATEGORY_COLORS[tch.category],
                          )}
                        >
                          {tch.name}
                          <span className="ml-1.5 opacity-60">
                            {CATEGORY_LABEL_I18N[tch.category] ?? tch.category}
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </section>

                  {/* Audience */}
                  <section className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                      <Target className="h-3.5 w-3.5" />
                      {t.project.audience}
                    </div>
                    <p className="mt-2 text-sm text-foreground/90">
                      {project.audience}
                    </p>
                  </section>

                  {/* Related projects */}
                  {relatedProjects.length > 0 && (
                    <section>
                      <SectionTitle icon={Link2} title={t.project.related} />
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {relatedProjects.map((rp) => (
                          <a
                            key={rp.slug}
                            href={rp.url}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40"
                          >
                            <div
                              className={cn(
                                "grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white",
                                rp.accent,
                              )}
                            >
                              <DynamicIcon name={rp.icon} className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold">
                                {rp.name}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">
                                {rp.tagline}
                              </div>
                            </div>
                            <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                          </a>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 overflow-hidden border-t border-border/60 bg-card/40 px-3 py-3 sm:px-6">
                <Button asChild size="sm" className="h-8 rounded-full text-xs sm:h-9 sm:text-sm">
                  <Link href={project.url} target="_blank" rel="noreferrer">
                    {t.project.open}
                    <ArrowUpRight className="ml-1 h-3 w-3 sm:ml-1.5 sm:h-3.5 sm:w-3.5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full text-xs sm:h-9 sm:text-sm"
                  onClick={handleCopyShare}
                >
                  {copied ? (
                    <>
                      <Check className="mr-1 h-3 w-3 text-emerald-500 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
                      {t.project.copied}
                    </>
                  ) : (
                    <>
                      <Share2 className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
                      {t.project.share}
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-full text-xs sm:h-9 sm:text-sm"
                  onClick={onClose}
                >
                  {t.project.close}
                </Button>
                <span className="ml-auto hidden sm:inline">
                  <ProjectViews slug={project.slug} />
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/80">
      <Icon className="h-3.5 w-3.5 text-primary" />
      {title}
    </div>
  );
}

function QuickFact({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1 truncate text-xs font-medium text-foreground">
        {value}
      </div>
    </>
  );
  if (href) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noreferrer"
        className="block truncate rounded-lg border border-border/60 bg-card/50 p-2.5 transition-colors hover:border-primary/40 hover:bg-card"
      >
        {content}
      </Link>
    );
  }
  return (
    <div className="rounded-lg border border-border/60 bg-card/50 p-2.5">
      {content}
    </div>
  );
}
