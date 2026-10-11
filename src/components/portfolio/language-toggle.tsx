"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import { useI18n } from "@/components/portfolio/i18n-provider";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();

  return (
    <div
      role="group"
      aria-label="Idioma"
      className="flex items-center rounded-full border border-border/60 bg-background/60 p-0.5 text-xs backdrop-blur"
    >
      <Globe className="ml-1.5 mr-1 h-3.5 w-3.5 text-muted-foreground" />
      <button
        type="button"
        onClick={() => setLocale("es")}
        aria-pressed={locale === "es"}
        className={cn(
          "rounded-full px-2 py-1 font-medium transition-colors",
          locale === "es"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        ES
      </button>
      <button
        type="button"
        onClick={() => setLocale("pt")}
        aria-pressed={locale === "pt"}
        className={cn(
          "rounded-full px-2 py-1 font-medium transition-colors",
          locale === "pt"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        PT
      </button>
    </div>
  );
}
