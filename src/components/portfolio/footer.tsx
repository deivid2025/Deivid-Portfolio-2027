"use client";

import * as React from "react";
import Link from "next/link";
import { Terminal, Heart } from "lucide-react";
import { profile } from "@/lib/projects";
import { DynamicIcon } from "@/components/portfolio/dynamic-icon";
import { useI18n } from "@/components/portfolio/i18n-provider";
import { Newsletter } from "@/components/portfolio/newsletter";

export function Footer() {
  const { t } = useI18n();
  const navLinks = [
    { href: "#work", label: t.nav.projects },
    { href: "#process", label: t.nav.process },
    { href: "#certs", label: "Certificaciones" },
    { href: "#blog", label: t.nav.blog },
    { href: "#faq", label: t.nav.faq },
    { href: "#contact", label: t.nav.contact },
  ];

  return (
    <footer className="mt-auto border-t border-border/60 bg-card/40 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Link
              href="#top"
              className="group flex items-center gap-2 font-mono text-sm font-semibold"
              suppressHydrationWarning
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Terminal className="h-4 w-4" />
              </span>
              deivid<span className="text-primary">.tech</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Soluciono problemas reales de empresas con software que funciona.
              No vendo humo, entrego sistemas en producción.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {t.about.location}
            </p>
            <div className="mt-5 max-w-xs">
              <Newsletter />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
                {t.footer.nav}
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
                {t.footer.systems}
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {profile.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <DynamicIcon
                        name={s.icon}
                        className="h-3.5 w-3.5 text-primary transition-transform group-hover:scale-110"
                      />
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
                {t.footer.contact}
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {profile.email}
                  </a>
                </li>
                <li className="text-muted-foreground">{t.footer.response}</li>
                <li className="text-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground" />
                    {t.footer.available}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <div>
            © {new Date().getFullYear()} {profile.brand}. {t.footer.rights}
          </div>
          <div className="flex items-center gap-1.5">
            {t.footer.madeWith} <Heart className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <Link
            href="/admin"
            className="text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
          >
            admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
