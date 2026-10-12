"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DynamicIcon } from "@/components/portfolio/dynamic-icon";
import { ProjectViews } from "@/components/portfolio/project-views";
import { useI18n } from "@/components/portfolio/i18n-provider";
import { useTilt } from "@/components/portfolio/use-tilt";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/projects";

const STATUS_STYLE: Record<Project["status"], string> = {
  live: "bg-foreground/10 text-foreground border-foreground/20",
  beta: "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30",
  maintenance: "bg-muted text-muted-foreground border-border",
};

export function ProjectCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: (p: Project) => void;
}) {
  const { t } = useI18n();
  const { ref: tiltRef, handleMouseMove, handleMouseLeave, tiltStyle } =
    useTilt<HTMLDivElement>(6);
  const STATUS_LABEL: Record<Project["status"], string> = {
    live: t.project.status.live,
    beta: t.project.status.beta,
    maintenance: t.project.status.maintenance,
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      style={{ perspective: "1000px" }}
    >
      <div
        ref={tiltRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={tiltStyle}
        className="h-full"
      >
      <Card
        className={cn(
          "group relative h-full overflow-hidden border-border/60 bg-card/60 backdrop-blur transition-shadow duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5",
        )}
      >
        {/* Cover — real screenshot */}
        <div className="relative h-44 overflow-hidden sm:h-52">
          <img
            src={project.screenshot}
            alt={`Portada de ${project.name}`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
          {/* Subtle dark overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

          {/* Big watermark icon */}
          <DynamicIcon
            name={project.icon}
            className="absolute -right-6 -top-6 h-40 w-40 text-white/15 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
          />

          <div className="absolute left-4 top-4 flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "border bg-background/70 backdrop-blur",
                STATUS_STYLE[project.status],
              )}
            >
              <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current" />
              {STATUS_LABEL[project.status]}
            </Badge>
            <Badge
              variant="outline"
              className="border-border/60 bg-background/70 text-foreground backdrop-blur"
            >
              {project.category}
            </Badge>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="font-mono text-[11px] uppercase tracking-widest text-white/70">
                {project.year} · {project.category}
              </div>
              <h3 className="mt-1 line-clamp-2 text-xl font-bold leading-tight text-white drop-shadow-sm sm:text-2xl">
                {project.name}
              </h3>
            </div>
            <div className="hidden shrink-0 rounded-xl bg-white/15 p-2 backdrop-blur sm:block">
              <DynamicIcon name={project.icon} className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <CardContent className="flex flex-col gap-4 p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {project.summary}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {project.techStack.slice(0, 5).map((t) => (
              <span
                key={t.name}
                className="rounded-md border border-border/60 bg-background/60 px-2 py-1 font-mono text-[11px] text-muted-foreground"
              >
                {t.name}
              </span>
            ))}
            {project.techStack.length > 5 && (
              <span className="rounded-md border border-border/60 bg-background/60 px-2 py-1 font-mono text-[11px] text-muted-foreground">
                +{project.techStack.length - 5}
              </span>
            )}
          </div>

          <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {project.highlights.slice(0, 4).map((h) => (
              <li
                key={h}
                className="flex items-start gap-1.5 text-xs text-foreground/80"
              >
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="leading-tight">{h}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                className="h-9 rounded-full"
                onClick={() => onOpen(project)}
              >
                {t.projects.viewDetail}
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 rounded-full"
              >
                <Link href={project.url} target="_blank" rel="noreferrer">
                  {t.projects.visit}
                  <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <ProjectViews slug={project.slug} />
          </div>
        </CardContent>
      </Card>
      </div>
    </motion.div>
  );
}
