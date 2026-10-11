"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Search,
  Rocket,
  FileText,
  Sticker,
  Truck,
  FileScan,
  Mail,
  Home,
  Briefcase,
  Star,
  Code2,
  HelpCircle,
  Hash,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { projects } from "@/lib/projects";
import { updates } from "@/lib/content";
import { useI18n } from "@/components/portfolio/i18n-provider";

const PROJECT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sticker,
  Truck,
  FileScan,
};

export function CommandPalette() {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const SECTIONS = [
    { id: "top", label: t.nav.home, icon: Home },
    { id: "work", label: t.nav.projects, icon: Briefcase },
    { id: "process", label: t.nav.process, icon: Rocket },
    { id: "certs", label: "Certificaciones", icon: ShieldCheck },
    { id: "blog", label: t.nav.blog, icon: FileText },
    { id: "stack", label: t.nav.stack, icon: Code2 },
    { id: "faq", label: t.nav.faq, icon: HelpCircle },
    { id: "contact", label: t.nav.contact, icon: Mail },
  ];

  // Global shortcut: ⌘K (mac) / Ctrl+K (win/linux). Also "/" when not typing.
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const goSection = (id: string) => {
    setOpen(false);
    // wait a tick so the dialog unmounts before scrolling
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const openProject = (url: string) => {
    setOpen(false);
    setTimeout(() => window.open(url, "_blank", "noopener,noreferrer"), 60);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-40 hidden items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-foreground sm:flex"
        aria-label={t.search.open}
      >
        <Search className="h-3.5 w-3.5" />
        {t.search.short}
        <kbd className="ml-1 rounded border border-border/60 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t.search.placeholder} />
        <CommandList>
          <CommandEmpty>{t.search.empty}</CommandEmpty>

          <CommandGroup heading={t.search.groups.nav}>
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <CommandItem
                  key={s.id}
                  onSelect={() => goSection(s.id)}
                  value={`nav ${s.label}`}
                >
                  <Icon className="mr-2 h-4 w-4 text-primary" />
                  {s.label}
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading={t.search.groups.projects}>
            {projects.map((p) => {
              const Icon = PROJECT_ICONS[p.icon] ?? Rocket;
              return (
                <CommandItem
                  key={p.slug}
                  onSelect={() => openProject(p.url)}
                  value={`project ${p.name} ${p.tagline}`}
                >
                  <Icon className="mr-2 h-4 w-4 text-primary" />
                  <span className="flex-1">{p.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.category}
                  </span>
                  <ExternalLink className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading={t.search.groups.blog}>
            {updates.map((u) => (
              <CommandItem
                key={u.slug}
                onSelect={() => goSection("blog")}
                value={`post ${u.title} ${u.tags.join(" ")}`}
              >
                <Hash className="mr-2 h-4 w-4 text-primary" />
                <span className="flex-1 truncate">{u.title}</span>
                <span className="text-xs text-muted-foreground">
                  {u.readTime} min
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
