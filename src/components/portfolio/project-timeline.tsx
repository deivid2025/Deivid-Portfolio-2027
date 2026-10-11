"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { projects } from "@/lib/projects";
import { useI18n } from "@/components/portfolio/i18n-provider";
import { DynamicIcon } from "@/components/portfolio/dynamic-icon";
import { cn } from "@/lib/utils";

const STATUS_DOT: Record<string, string> = {
  live: "bg-emerald-500 ring-emerald-500/20",
  beta: "bg-amber-500 ring-amber-500/20",
  maintenance: "bg-zinc-500 ring-zinc-500/20",
};

const STATUS_TEXT: Record<string, string> = {
  live: "En vivo",
  beta: "Beta",
  maintenance: "Mantenimiento",
};

export function ProjectTimeline() {
  const { t } = useI18n();
  const sorted = [...projects].sort((a, b) => a.year.localeCompare(b.year));

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Timeline
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {sorted.length} proyectos
        </span>
      </div>

      <div className="mt-4 space-y-0">
        {sorted.map((p, i) => (
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="relative flex items-stretch gap-3"
          >
            {/* Line + dot */}
            <div className="flex w-8 shrink-0 flex-col items-center">
              <div className="flex h-10 items-center">
                <div
                  className={cn(
                    "h-3 w-3 rounded-full ring-4",
                    STATUS_DOT[p.status] ?? STATUS_DOT.live,
                  )}
                />
              </div>
              {i < sorted.length - 1 && (
                <div className="w-px flex-1 bg-border/40" />
              )}
            </div>

            {/* Content card */}
            <div className="mb-2 flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden rounded-xl border border-border/40 bg-background/40 p-2.5">
              <div
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br",
                  p.accent,
                )}
              >
                <DynamicIcon
                  name={p.icon}
                  className="h-4 w-4 text-white"
                />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-medium text-foreground">
                    {p.name}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded px-1 py-0.5 text-[8px] font-medium",
                      p.status === "live"
                        ? "bg-emerald-500/15 text-emerald-500"
                        : "bg-amber-500/15 text-amber-500",
                    )}
                  >
                    {STATUS_TEXT[p.status] ?? p.status}
                  </span>
                </div>
                <p className="truncate text-[10px] text-muted-foreground">
                  {p.tagline}
                </p>
              </div>
              <span className="shrink-0 font-mono text-xs font-bold text-primary">
                {p.year}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
