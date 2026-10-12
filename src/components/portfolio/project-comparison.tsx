"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitCompare,
  X,
  Check,
  Minus,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/components/portfolio/i18n-provider";
import { DynamicIcon } from "@/components/portfolio/dynamic-icon";
import { cn } from "@/lib/utils";
import { projects as staticProjects, type Project } from "@/lib/projects";

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects", { cache: "no-store" });
  if (!res.ok) return staticProjects;
  const data = (await res.json()) as { projects: Project[] };
  return data.projects ?? staticProjects;
}

const MAX_COMPARE = 4;

export function ProjectComparison() {
  const { t } = useI18n();
  const { data } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 60_000,
  });
  const allProjects = data ?? staticProjects;

  const [open, setOpen] = React.useState(false);
  const [selectedSlugs, setSelectedSlugs] = React.useState<string[]>(
    allProjects.slice(0, 2).map((p) => p.slug),
  );

  const selected = selectedSlugs
    .map((slug) => allProjects.find((p) => p.slug === slug))
    .filter(Boolean) as Project[];

  const availableToAdd = allProjects.filter(
    (p) => !selectedSlugs.includes(p.slug),
  );

  const addProject = (slug: string) => {
    if (selectedSlugs.length < MAX_COMPARE && !selectedSlugs.includes(slug)) {
      setSelectedSlugs([...selectedSlugs, slug]);
    }
  };

  const removeProject = (slug: string) => {
    setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
      >
        <GitCompare className="h-3.5 w-3.5 text-primary" />
        Comparar proyectos
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.25 }}
              className="relative max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/60 bg-card/40 px-5 py-3 sm:px-6">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <GitCompare className="h-4 w-4 text-primary" />
                  Comparar proyectos
                  <Badge variant="outline" className="ml-2 font-mono text-[10px]">
                    {selected.length}/{MAX_COMPARE}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar comparación"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Add project bar */}
              {availableToAdd.length > 0 && selected.length < MAX_COMPARE && (
                <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3 sm:px-6">
                  <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                  <Select value="" onValueChange={addProject}>
                    <SelectTrigger className="h-8 w-48 text-xs">
                      <SelectValue placeholder="Agregar proyecto..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableToAdd.map((p) => (
                        <SelectItem key={p.slug} value={p.slug}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Comparison grid — N columns */}
              {selected.length >= 2 ? (
                <div className="max-h-[68vh] overflow-auto scrollbar-thin">
                  <div
                    className="grid min-w-fit divide-x divide-border/60"
                    style={{ gridTemplateColumns: `repeat(${selected.length}, minmax(240px, 1fr))` }}
                  >
                    {selected.map((project) => (
                      <div key={project.slug} className="p-4 sm:p-5">
                        <CompareColumn project={project} onRemove={removeProject} />
                      </div>
                    ))}
                  </div>

                  {/* Feature comparison matrix */}
                  <div className="border-t border-border/60 px-4 py-3 sm:px-5">
                    <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                      Funcionalidades
                    </div>
                    <div className="space-y-1">
                      {mergeFeatures(selected).map((feat) => (
                        <div
                          key={feat}
                          className="grid border-b border-border/30 py-1 text-xs last:border-0"
                          style={{ gridTemplateColumns: `repeat(${selected.length}, 1fr)` }}
                        >
                          {selected.map((p) => {
                            const has = p.features.some((f) => f.title === feat);
                            return (
                              <div key={p.slug} className="flex items-center gap-1.5 px-1">
                                {has ? (
                                  <Check className="h-3 w-3 shrink-0 text-foreground" />
                                ) : (
                                  <Minus className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                                )}
                                <span
                                  className={cn(
                                    "truncate",
                                    !has && "text-muted-foreground/50",
                                  )}
                                >
                                  {feat}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shared tech stack */}
                  <div className="border-t border-border/60 px-4 py-3 sm:px-5">
                    <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                      Stack compartido ({selected.length} proyectos)
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selected[0].techStack
                        .filter((ta) =>
                          selected.every((p) =>
                            p.techStack.some((tb) => tb.name === ta.name),
                          ),
                        )
                        .map((tech) => (
                          <Badge
                            key={tech.name}
                            variant="outline"
                            className="border-primary/30 bg-primary/10 font-mono text-[10px] text-primary"
                          >
                            {tech.name}
                          </Badge>
                        ))}
                      {selected[0].techStack.filter((ta) =>
                        selected.every((p) =>
                          p.techStack.some((tb) => tb.name === ta.name),
                        ),
                      ).length === 0 && (
                        <span className="text-xs text-muted-foreground">
                          Sin technologies en común entre todos los proyectos.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  Seleccioná al menos 2 proyectos para comparar. Agregá más con el
                  selector de arriba.
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CompareColumn({
  project,
  onRemove,
}: {
  project: Project;
  onRemove: (slug: string) => void;
}) {
  return (
    <div>
      {/* Cover */}
      <div className="relative h-20 overflow-hidden rounded-xl">
        <img
          src={project.screenshot}
          alt={project.name}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-50 mix-blend-multiply",
            project.accent,
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <DynamicIcon
          name={project.icon}
          className="absolute right-2 top-2 h-6 w-6 text-white/40"
        />
        <button
          onClick={() => onRemove(project.slug)}
          className="absolute right-2 bottom-2 grid h-6 w-6 place-items-center rounded-full bg-black/40 text-white/80 backdrop-blur transition-colors hover:bg-destructive hover:text-white"
          aria-label={`Quitar ${project.name}`}
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <h3 className="text-base font-bold leading-tight">{project.name}</h3>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
        {project.tagline}
      </p>

      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
        <span className="rounded border border-border/60 bg-background/60 px-1.5 py-0.5">
          {project.category}
        </span>
        <span className="rounded border border-border/60 bg-background/60 px-1.5 py-0.5">
          {project.year}
        </span>
        <span
          className={cn(
            "rounded border px-1.5 py-0.5",
            project.status === "live"
              ? "border-foreground/20 bg-foreground/10 text-foreground"
              : "border-muted-foreground/20 bg-muted-foreground/10 text-muted-foreground",
          )}
        >
          {project.status === "live" ? "En vivo" : "Beta"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {project.metrics.slice(0, 4).map((m) => (
          <div
            key={m.label}
            className="rounded border border-border/60 bg-background/60 p-1.5 text-center"
          >
            <div className="font-mono text-sm font-bold text-primary">
              {m.value}
            </div>
            <div className="text-[9px] text-muted-foreground">{m.label}</div>
          </div>
        ))}
      </div>

      <a
        href={project.url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
      >
        Visitar proyecto
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

function mergeFeatures(projects: Project[]): string[] {
  const set = new Set<string>();
  projects.forEach((p) => p.features.forEach((f) => set.add(f.title)));
  return Array.from(set);
}
