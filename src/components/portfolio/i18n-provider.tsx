"use client";

import * as React from "react";
import { dictionaries, type Dict, type Locale } from "@/lib/i18n";

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dict;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "deividtech.locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("es");

  // Hydrate from localStorage on mount.
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved === "es" || saved === "pt") setLocaleState(saved);
    } catch {
      // ignore (private mode / SSR)
    }
  }, []);

  // Keep <html lang> in sync for accessibility + SEO.
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = React.useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  }, []);

  const value = React.useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}
