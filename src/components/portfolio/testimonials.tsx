"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { testimonials as fallbackTestimonials } from "@/lib/content";
import { useI18n } from "@/components/portfolio/i18n-provider";
import { cn } from "@/lib/utils";

interface ApiTestimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  avatarInitials: string;
  accent: string;
  project?: string;
}

async function fetchTestimonials(): Promise<ApiTestimonial[]> {
  try {
    const res = await fetch("/api/testimonials", { cache: "no-store" });
    if (!res.ok) throw new Error("API error");
    const data = (await res.json()) as { testimonials: ApiTestimonial[] };
    return data.testimonials ?? fallbackTestimonials;
  } catch {
    return fallbackTestimonials;
  }
}

export function Testimonials() {
  const { t } = useI18n();
  const { data, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: fetchTestimonials,
    staleTime: 60_000,
  });

  const testimonials = data ?? fallbackTestimonials;

  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const [paused, setPaused] = React.useState(false);

  const total = testimonials.length;

  // Clamp index when the data length changes (e.g. when API data arrives).
  React.useEffect(() => {
    if (index > 0 && index >= total) setIndex(0);
  }, [total, index]);

  const go = React.useCallback(
    (dir: number) => {
      setDirection(dir);
      setIndex((cur) => (cur + dir + total) % total);
    },
    [total],
  );

  React.useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => go(1), 6000);
    return () => clearInterval(interval);
  }, [paused, go]);

  const active = testimonials[Math.min(index, total - 1)] ?? testimonials[0];

  return (
    <section
      id="testimonials"
      className="scroll-mt-24 border-y border-border/40 bg-card/20 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Quote className="h-3.5 w-3.5 text-primary" />
            {t.testimonials.badge}
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {t.testimonials.title}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t.testimonials.subtitle}
          </p>
        </motion.div>

        <div
          className="relative mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative min-h-[280px] overflow-hidden rounded-3xl border border-border/60 bg-background/60 p-6 backdrop-blur sm:p-10">
            <Quote className="absolute right-6 top-6 h-16 w-16 text-primary/10" />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={active.name}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < active.rating
                          ? "fill-foreground text-foreground"
                          : "text-muted-foreground/40",
                      )}
                    />
                  ))}
                </div>

                <p className="mt-4 text-lg leading-relaxed text-foreground/90 sm:text-xl">
                  “{active.quote}”
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <div
                    className={cn(
                      "grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-lg",
                      active.accent,
                    )}
                  >
                    {active.avatarInitials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{active.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {active.role}
                      {active.project ? ` · sobre ${active.project}` : ""}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {testimonials.map((tm, i) => (
                <button
                  key={tm.name}
                  aria-label={`Testimonial ${i + 1}`}
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index
                      ? "w-8 bg-primary"
                      : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/70",
                  )}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label={t.testimonials.prev}
                onClick={() => go(-1)}
                className="h-9 w-9 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label={t.testimonials.next}
                onClick={() => go(1)}
                className="h-9 w-9 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-sm text-muted-foreground">
          {t.testimonials.cta}{" "}
          <Link
            href="#contact"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t.nav.workTogether}
          </Link>
          .
        </div>
      </div>
    </section>
  );
}
