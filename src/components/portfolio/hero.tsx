"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profile } from "@/lib/projects";
import { StatCounter } from "@/components/portfolio/stat-counter";
import { useI18n } from "@/components/portfolio/i18n-provider";
import { IdBadge } from "@/components/portfolio/id-badge";
import { ShapeWavesBackground } from "@/components/anim/shapewaves-background";

const TYPING_WORDS = [
  "full-stack developer",
  "product builder",
  "IA aplicada",
  "e-commerce conversacional",
];

function useTypewriter(words: string[], typingMs = 90, pauseMs = 1600) {
  const [text, setText] = React.useState("");
  const [i, setI] = React.useState(0);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    const word = words[i % words.length];
    let t: ReturnType<typeof setTimeout>;
    if (!deleting && text === word) {
      t = setTimeout(() => setDeleting(true), pauseMs);
    } else if (deleting && text === "") {
      setDeleting(false);
      setI((v) => v + 1);
    } else {
      t = setTimeout(
        () => {
          setText((cur) =>
            deleting ? cur.slice(0, -1) : word.slice(0, cur.length + 1),
          );
        },
        deleting ? typingMs / 2 : typingMs,
      );
    }
    return () => clearTimeout(t);
  }, [text, deleting, i, words, typingMs, pauseMs]);

  return text;
}

export function Hero() {
  const { t } = useI18n();
  const typed = useTypewriter(t.hero.typingWords);
  const { scrollYProgress } = useScroll();
  const auroraY1 = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const auroraY2 = useTransform(scrollYProgress, [0, 0.3], [0, 60]);
  const auroraY3 = useTransform(scrollYProgress, [0, 0.3], [0, -40]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.85]);

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-noise pt-20 pb-12 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-28"
    >
      {/* Animated shape-wave field (WebGPU, falls back to bg color) */}
      <ShapeWavesBackground />

      {/* Soft mask so the shape field fades into the page edges */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid mask-fade-b opacity-40" />
        <motion.div
          style={{ y: auroraY1 }}
          className="absolute -top-32 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px] animate-float-slow"
        />
        <motion.div
          style={{ y: auroraY2 }}
          className="absolute right-10 top-40 h-72 w-72 rounded-full bg-foreground/10 blur-[120px] animate-float-slow [animation-delay:-6s]"
        />
        <motion.div
          style={{ y: auroraY3 }}
          className="absolute left-6 top-60 h-56 w-56 rounded-full bg-foreground/5 blur-[100px] animate-float-slow [animation-delay:-3s]"
        />
        {/* Vignette so the text remains legible over the shape field */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/70" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/60 to-transparent" />
      </div>

      <motion.div style={{ opacity: heroOpacity }} className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-2 sm:gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          {/* Left: text */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {t.hero.badge}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
            >
              {t.hero.greeting("David Garay")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-3 text-base text-muted-foreground sm:text-lg"
            >
              <span className="block min-h-[1.5em]">
                {typed}
                <span className="ml-0.5 inline-block h-[0.9em] w-[2px] animate-pulse bg-primary align-middle" />
              </span>
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base"
            >
              {profile.bio}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Button asChild size="lg" className="h-12 rounded-full px-6 text-base">
                <Link href="#work">
                  Ver proyectos
                  <ArrowDown className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full px-6 text-base"
              >
                <Link href="#contact">
                  Trabajemos juntos
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Right: ID Badge drops from above */}
          <div className="w-[16rem] shrink-0 self-center sm:w-[20rem] lg:mt-0 lg:w-auto lg:self-start">
            <IdBadge />
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6"
        >
          {[
            { value: "3", label: t.hero.stats.systems },
            { value: "50k+", label: t.hero.stats.lines },
            { value: "15+", label: t.hero.stats.techs },
            { value: "5+", label: t.hero.stats.years },
          ].map((s) => (
            <div
              key={s.label}
              className="group/stats relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur transition-colors hover:border-primary/40"
            >
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover/stats:opacity-100" />
              <div className="relative font-mono text-2xl font-bold text-primary sm:text-3xl">
                <StatCounter value={s.value} />
              </div>
              <div className="relative mt-1 text-xs text-muted-foreground sm:text-sm">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
