"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { ShapeWaves } from "./shapewaves";

/**
 * Theme-aware ShapeWaves background for the hero.
 *
 * Picks monochrome colors based on the resolved theme so the animated
 * shape field blends with the rest of the portfolio in light and dark
 * mode. If WebGPU is unavailable, ShapeWaves degrades gracefully to a
 * solid backgroundColor (which matches the section background), so the
 * hero always looks intentional.
 */
export function ShapeWavesBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  // Monochrome palette — no warm colors, only neutral grays.
  const colors = isDark
    ? {
        color: "#3f3f46", // zinc-700 — glyphs
        hoverColor: "#ffffff", // white splash on hover
        backgroundColor: "#0a0a0a", // near-black
      }
    : {
        color: "#a1a1aa", // zinc-400 — soft gray glyphs
        hoverColor: "#18181b", // near-black splash on hover
        backgroundColor: "#f8f8f7", // matches --background in light mode
      };

  return (
    <div className="absolute inset-0 -z-10">
      <ShapeWaves
        text=""
        shapes="mixed"
        cellSize={11}
        dotSize={0.7}
        color={colors.color}
        hoverColor={colors.hoverColor}
        backgroundColor={colors.backgroundColor}
        speed={0.7}
        scale={1.1}
        contrast={1}
        brightness={0.42}
        flow={0.6}
        direction={25}
        fade={0.35}
        interactive={true}
        splashRadius={44}
        splashStrength={0.5}
        glow={0.32}
        intro={true}
        introDuration={1.8}
        paused={false}
        className="h-full w-full"
      />
    </div>
  );
}
