"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Server,
  Database,
  Cloud,
  Brain,
  Wrench,
} from "lucide-react";
import { projects } from "@/lib/projects";
import { useI18n } from "@/components/portfolio/i18n-provider";
import { TechRadarChart } from "@/components/portfolio/tech-radar-chart";

const CATEGORY_ICONS = {
  frontend: Code2,
  backend: Server,
  database: Database,
  infra: Cloud,
  ai: Brain,
  tooling: Wrench,
} as const;

type Cat = keyof typeof CATEGORY_ICONS;

export function TechStack() {
  const { t } = useI18n();
  const categories: { key: Cat; label: string; icon: typeof Code2 }[] = [
    { key: "frontend", label: t.stack.categories.frontend, icon: Code2 },
    { key: "backend", label: t.stack.categories.backend, icon: Server },
    { key: "database", label: t.stack.categories.database, icon: Database },
    { key: "infra", label: t.stack.categories.infra, icon: Cloud },
    { key: "ai", label: t.stack.categories.ai, icon: Brain },
    { key: "tooling", label: t.stack.categories.tooling, icon: Wrench },
  ];

  const byCat = React.useMemo(() => {
    const map = new Map<Cat, Set<string>>();
    for (const p of projects) {
      for (const tch of p.techStack) {
        const set = map.get(tch.category as Cat) ?? new Set<string>();
        set.add(tch.name);
        map.set(tch.category as Cat, set);
      }
    }
    return map;
  }, []);

  return (
    <section
      id="stack"
      className="scroll-mt-24 border-y border-border/40 bg-card/20 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            {t.stack.badge}
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {t.stack.title}
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t.stack.subtitle}
          </p>
        </motion.div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => {
            const items = Array.from(byCat.get(c.key) ?? new Set<string>());
            if (items.length === 0) return null;
            const Icon = c.icon;
            return (
              <motion.div
                key={c.key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur"
              >
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold">{c.label}</h3>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {items.map((it) => (
                    <span
                      key={it}
                      className="rounded-md border border-border/60 bg-background/60 px-2 py-1 font-mono text-[11px] text-muted-foreground"
                    >
                      {it}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8">
          <TechRadarChart />
        </div>
      </div>
    </section>
  );
}
