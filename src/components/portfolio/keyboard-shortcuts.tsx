"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const SHORTCUTS = [
  { keys: ["⌘", "K"], label: "Abrir búsqueda / command palette" },
  { keys: ["/"], label: "Abrir búsqueda (cuando no estás escribiendo)" },
  { keys: ["Esc"], label: "Cerrar modal / palette" },
  { keys: ["G", "H"], label: "Ir al inicio (home)" },
  { keys: ["G", "P"], label: "Ir a proyectos" },
  { keys: ["G", "B"], label: "Ir al blog" },
  { keys: ["G", "C"], label: "Ir a contacto" },
  { keys: ["T"], label: "Cambiar tema (claro/oscuro)" },
  { keys: ["L"], label: "Cambiar idioma (ES/PT)" },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // "?" opens the help
      if (
        e.key === "?" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      // Esc closes
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // "g" prefix navigation
  React.useEffect(() => {
    let prefix = false;
    let prefixTimer: ReturnType<typeof setTimeout>;
    const handler = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      )
        return;
      if (e.key === "g" && !prefix) {
        prefix = true;
        clearTimeout(prefixTimer);
        prefixTimer = setTimeout(() => {
          prefix = false;
        }, 800);
        return;
      }
      if (prefix) {
        prefix = false;
        clearTimeout(prefixTimer);
        const map: Record<string, string> = {
          h: "top",
          p: "work",
          b: "blog",
          c: "contact",
        };
        const id = map[e.key.toLowerCase()];
        if (id) {
          e.preventDefault();
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }
      // single-key shortcuts (no prefix)
      if (e.key.toLowerCase() === "t" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        document.querySelector<HTMLButtonElement>('[aria-label="Cambiar tema"]')?.click();
      }
      if (e.key.toLowerCase() === "l" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        // Toggle ES/PT by clicking the inactive language button
        const ptBtn = document.querySelector<HTMLButtonElement>(
          'button[aria-pressed="false"]',
        );
        ptBtn?.click();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-16 left-5 z-40 hidden h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/70 text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-foreground sm:flex"
        aria-label="Ver atajos de teclado (?)"
        title="Atajos de teclado (?)"
      >
        <Keyboard className="h-3.5 w-3.5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border/60 bg-card/40 px-5 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Keyboard className="h-4 w-4 text-primary" />
                  Atajos de teclado
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1 p-4">
                {SHORTCUTS.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted/50"
                  >
                    <span className="text-sm text-foreground/90">{s.label}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k, i) => (
                        <kbd
                          key={i}
                          className="rounded border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
                  💡 Presioná <kbd className="rounded border border-border/60 bg-muted px-1 py-0.5 font-mono text-[10px]">?</kbd> en cualquier momento para abrir esta ayuda.
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
