"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { ProjectCard } from "@/components/portfolio/project-card";
import { ProjectModal } from "@/components/portfolio/project-modal";
import { ProjectComparison } from "@/components/portfolio/project-comparison";
import { useIncrementProjectViews } from "@/components/portfolio/project-views";
import { useI18n } from "@/components/portfolio/i18n-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { projects as staticProjects, type Project } from "@/lib/projects";

type ProjectsResponse = {
  count: number;
  projects: Project[];
};

async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await fetch("/api/projects", { cache: "no-store" });
    if (!res.ok) throw new Error("API error");
    const data = (await res.json()) as ProjectsResponse;
    return data.projects ?? staticProjects;
  } catch {
    return staticProjects;
  }
}

type FilterKey = "all" | "saas" | "ecommerce" | "logistics" | "ai";

const CATEGORY_MATCH: Record<Exclude<FilterKey, "all">, Project["category"]> = {
  saas: "Producto SaaS",
  ecommerce: "E-commerce",
  logistics: "Logística",
  ai: "Productividad IA",
};

export function Projects() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [filter, setFilter] = React.useState<FilterKey>("all");
  const [selected, setSelected] = React.useState<Project | null>(null);
  const incrementViews = useIncrementProjectViews();
  const didDeepLink = React.useRef(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 60_000,
  });

  const projectsData = data ?? [];

  const openProject = React.useCallback(
    (p: Project) => {
      setSelected(p);
      incrementViews.mutate(p.slug);
    },
    [incrementViews],
  );

  // Deep-link: ?project=slug opens the project modal on first load.
  React.useEffect(() => {
    if (didDeepLink.current) return;
    const slug = searchParams.get("project");
    if (!slug) return;
    const target =
      projectsData.find((p) => p.slug === slug) ??
      staticProjects.find((p) => p.slug === slug);
    if (target) {
      didDeepLink.current = true;
      // Scroll to #work first so the modal has visual context, then open.
      const el = document.getElementById("work");
      if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
      setTimeout(() => openProject(target), 250);
    }
  }, [searchParams, projectsData, openProject]);

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "all", label: t.projects.filters.all },
    { key: "saas", label: t.projects.filters.saas },
    { key: "ecommerce", label: t.projects.filters.ecommerce },
    { key: "logistics", label: t.projects.filters.logistics },
    { key: "ai", label: t.projects.filters.ai },
  ];

  const filtered =
    filter === "all"
      ? projectsData
      : projectsData.filter((p) => p.category === CATEGORY_MATCH[filter]);

  return (
    <section id="work" className="scroll-mt-24 py-20 sm:py-28">
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
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {t.projects.badge}
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                {t.projects.title}
              </span>
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {t.projects.subtitle}
            </p>
          </div>
        </motion.div>

        {/* Filters + comparison */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                filter === f.key
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
          <div className="ml-auto">
            <ProjectComparison />
          </div>
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <ProjectSkeleton key={i} loading={t.updates.loading} />
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
              <ProjectCard
                key={p.slug}
                project={p}
                index={i}
                onOpen={openProject}
              />
            ))}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
              {t.projects.empty}
            </div>
          )}
        </div>
      </div>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

function ProjectSkeleton({ loading }: { loading: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
      <div className="h-48 animate-pulse bg-muted" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
        <div className="flex gap-2 pt-2">
          <div className="h-8 w-24 animate-pulse rounded-full bg-muted" />
          <div className="h-8 w-24 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 p-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        {loading}
      </div>
    </div>
  );
}
