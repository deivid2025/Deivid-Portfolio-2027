"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/components/portfolio/i18n-provider";
import { DynamicIcon } from "@/components/portfolio/dynamic-icon";

const STEP_ICONS = ["Search", "FileText", "Code2", "Rocket"];

export function Process() {
  const { t } = useI18n();
  const steps = t.process.steps.map((s, i) => ({
    ...s,
    number: String(i + 1).padStart(2, "0"),
    icon: STEP_ICONS[i] ?? "Rocket",
  }));

  return (
    <section id="process" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            {t.process.badge}
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {t.process.title}
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t.process.subtitle}
          </p>
        </motion.div>

        <div className="relative mt-12">
          <div
            aria-hidden
            className="absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent sm:left-1/2"
          />

          <div className="space-y-6 sm:space-y-0">
            {steps.map((step, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative sm:grid sm:grid-cols-2 sm:gap-8 sm:py-4"
                >
                  <div className="absolute left-6 top-1 z-10 -translate-x-1/2 sm:left-1/2">
                    <div className="grid h-3 w-3 place-items-center rounded-full bg-primary ring-4 ring-background" />
                  </div>

                  <div
                    className={[
                      "ml-12 sm:ml-0",
                      isLeft
                        ? "sm:pr-8 sm:text-right"
                        : "sm:col-start-2 sm:pl-8",
                    ].join(" ")}
                  >
                    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                      <div
                        className={`flex items-center gap-3 ${
                          isLeft ? "sm:flex-row-reverse" : ""
                        }`}
                      >
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform group-hover:scale-105">
                          <DynamicIcon name={step.icon} className="h-5 w-5" />
                        </div>
                        <div className={isLeft ? "sm:text-right" : ""}>
                          <div className="font-mono text-xs text-muted-foreground">
                            {t.about.badge === "Sobre mí"
                              ? `Paso ${step.number}`
                              : `Passo ${step.number}`}{" "}
                            · {step.duration}
                          </div>
                          <h3 className="text-base font-semibold">
                            {step.title}
                          </h3>
                        </div>
                      </div>
                      <p
                        className={`mt-3 text-sm leading-relaxed text-muted-foreground ${
                          isLeft ? "sm:text-right" : ""
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
