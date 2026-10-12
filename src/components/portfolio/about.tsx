"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MapPin, Mail, CalendarCheck } from "lucide-react";
import { profile } from "@/lib/projects";
import { DynamicIcon } from "@/components/portfolio/dynamic-icon";
import { StatCounter } from "@/components/portfolio/stat-counter";
import { ContributionGraph } from "@/components/portfolio/contribution-graph";
import { ProjectTimeline } from "@/components/portfolio/project-timeline";
import { useI18n } from "@/components/portfolio/i18n-provider";

export function About() {
  const { t } = useI18n();
  const stats = [
    { value: "3", label: t.hero.stats.systems },
    { value: "50k+", label: t.hero.stats.lines },
    { value: "20+", label: t.hero.stats.techs },
    { value: "5+", label: t.hero.stats.years },
  ];

  return (
    <section
      id="about"
      className="scroll-mt-24 border-y border-border/40 bg-card/20 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t.about.badge}
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {t.about.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {profile.longBio}
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Me enfoco en tres ejes:{" "}
              <span className="font-semibold text-foreground">
                experiencias conversacionales
              </span>{" "}
              (DESPEGA!),{" "}
              <span className="font-semibold text-foreground">
                IA aplicada
              </span>{" "}
              (FactuSheet) y{" "}
              <span className="font-semibold text-foreground">
                sistemas operativos para nichos
              </span>{" "}
              (Redline). Todo con stack moderno, desplegado y mantenido.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {profile.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3.5 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:bg-card"
                >
                  <DynamicIcon
                    name={s.icon}
                    className="h-3.5 w-3.5 text-primary transition-transform group-hover:scale-110"
                  />
                  {s.label}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Side card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3">
                {/* GitHub profile photo */}
                <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-border/60 bg-muted">
                  <img
                    src={profile.avatar}
                    alt={`Foto de perfil de ${profile.name}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if GitHub avatar fails to load
                      const target = e.currentTarget;
                      target.style.display = "none";
                      const fallback = target.nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                  <div
                    className="absolute inset-0 hidden place-items-center bg-primary text-2xl font-bold text-primary-foreground"
                    style={{ display: "none" }}
                  >
                    D
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold">{profile.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {profile.role}
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  {t.about.location}
                </div>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <DynamicIcon name="Github" className="h-4 w-4 text-primary" />
                  {profile.githubUser}
                </a>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  <a
                    href={`mailto:${profile.email}`}
                    className="hover:text-foreground"
                  >
                    Escribíme
                  </a>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarCheck className="h-4 w-4 text-primary" />
                  {t.about.available}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-border/60 bg-background/60 p-3"
                  >
                    <div className="font-mono text-xl font-bold text-primary">
                      <StatCounter value={s.value} />
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <ContributionGraph />
              </div>

              <div className="mt-4">
                <ProjectTimeline />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
