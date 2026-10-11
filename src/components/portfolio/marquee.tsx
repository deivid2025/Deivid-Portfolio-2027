"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/components/portfolio/i18n-provider";

export function Marquee() {
  const { t } = useI18n();
  const items = t.marquee;
  return (
    <div className="relative overflow-hidden border-y border-border/60 bg-card/30 py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      <div className="flex w-max animate-marquee gap-3">
        {[...items, ...items].map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 font-mono text-xs text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {item}
          </span>
        ))}
      </div>
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      />
    </div>
  );
}
