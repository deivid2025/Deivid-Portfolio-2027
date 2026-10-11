"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from "recharts";
import { Radar as RadarIcon } from "lucide-react";
import { projects } from "@/lib/projects";
import { useI18n } from "@/components/portfolio/i18n-provider";

export function TechRadarChart() {
  const { t } = useI18n();

  const data = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      for (const tech of p.techStack) {
        counts.set(tech.category, (counts.get(tech.category) ?? 0) + 1);
      }
    }
    const labels: Record<string, string> = {
      frontend: t.stack.categories.frontend,
      backend: t.stack.categories.backend,
      database: t.stack.categories.database,
      infra: t.stack.categories.infra,
      ai: t.stack.categories.ai,
      tooling: t.stack.categories.tooling,
    };
    return Array.from(counts.entries()).map(([key, value]) => ({
      category: labels[key] ?? key,
      count: value,
    }));
  }, [t]);

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur"
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/80">
        <RadarIcon className="h-3.5 w-3.5 text-primary" />
        Radar de stack
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Distribución de tecnologías por categoría en los {projects.length}{" "}
        proyectos.
      </p>

      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fontSize: 10, fill: "currentColor", opacity: 0.6 }}
            />
            <PolarRadiusAxis
              domain={[0, max]}
              tick={{ fontSize: 9, fill: "currentColor", opacity: 0.3 }}
              tickCount={max + 1}
            />
            <Radar
              name="Techs"
              dataKey="count"
              stroke="oklch(0.74 0.18 55)"
              fill="oklch(0.74 0.18 55)"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "var(--popover-foreground)",
              }}
              formatter={(v: number) => [`${v} tecnologías`, ""]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
