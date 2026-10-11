"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { profile } from "@/lib/projects";
import { DynamicIcon } from "@/components/portfolio/dynamic-icon";
import { useI18n } from "@/components/portfolio/i18n-provider";

export function Services() {
  const { t } = useI18n();

  return (
    <section id="services" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            {t.services.badge}
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {t.services.title}
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t.services.subtitle}
          </p>
        </motion.div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {profile.services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform group-hover:scale-105">
                  <DynamicIcon name={s.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">
                  {t.services.items[i]?.title ?? s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t.services.items[i]?.description ?? s.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
