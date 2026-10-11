"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profile } from "@/lib/projects";
import { ThemeToggle } from "@/components/portfolio/theme-toggle";
import { LanguageToggle } from "@/components/portfolio/language-toggle";
import { useI18n } from "@/components/portfolio/i18n-provider";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const NAV_LINKS = [
    { href: "#work", label: t.nav.projects },
    { href: "#process", label: t.nav.process },
    { href: "#certs", label: "Certificaciones" },
    { href: "#blog", label: t.nav.blog },
    { href: "#stack", label: t.nav.stack },
    { href: "#faq", label: t.nav.faq },
    { href: "#contact", label: t.nav.contact },
  ];

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="#top"
          className="group flex items-center gap-2 font-mono text-sm font-semibold"
        >
          <span className="relative h-8 w-8 overflow-hidden rounded-lg border border-border/60 bg-muted">
            <img
              src={profile.avatar}
              alt="David"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const f = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (f) f.style.display = "grid";
              }}
            />
            <span className="absolute inset-0 hidden place-items-center bg-primary text-primary-foreground" style={{ display: "none" }}>
              <Terminal className="h-4 w-4" />
            </span>
          </span>
          <span className="tracking-tight" suppressHydrationWarning>
            deivid<span className="text-primary">.tech</span>
          </span>
        </Link>

        <div className="hidden items-center gap-0.5 xl:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-2.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <Button
            asChild
            size="sm"
            className="hidden h-9 rounded-full px-4 sm:flex"
          >
            <Link href="#contact">
              <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              {t.nav.available}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            aria-label={t.nav.openMenu}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-b border-border/60 bg-background/95 backdrop-blur-xl xl:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
              <Button asChild size="sm" className="mt-2">
                <Link href="#contact" onClick={() => setOpen(false)}>
                  {t.nav.workTogether}
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
