"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Cambiar tema"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative h-9 w-9 rounded-full border border-border/60 bg-background/60 backdrop-blur"
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-4 w-4 text-amber-400" />
        ) : (
          <Moon className="h-4 w-4 text-foreground" />
        )
      ) : (
        <span className="h-4 w-4" />
      )}
    </Button>
  );
}
