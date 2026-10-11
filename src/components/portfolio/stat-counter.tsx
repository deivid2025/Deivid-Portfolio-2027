"use client";

import * as React from "react";
import { useInView, animate } from "framer-motion";

function parseValue(raw: string): { target: number; suffix: string; prefix: string } {
  const match = raw.match(/^([^\d.-]*)([\d.]+)(.*)$/);
  if (!match) return { target: 0, suffix: "", prefix: "" };
  return {
    prefix: match[1] ?? "",
    target: parseFloat(match[2]),
    suffix: match[3] ?? "",
  };
}

function formatNumber(v: number, target: number): string {
  return Number.isInteger(target) ? Math.round(v).toString() : v.toFixed(1);
}

/**
 * Animated count-up stat. Renders the final value immediately on SSR/first
 * paint (no "0" flash) and only runs the count-up animation when the element
 * is scrolled into view. If the element was already in the viewport on mount,
 * it skips the animation entirely so there's no visible reset.
 */
export function StatCounter({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const { target, suffix, prefix } = parseValue(value);

  const [display, setDisplay] = React.useState(() => formatNumber(target, target));

  // Capture whether the element was in the viewport on mount. If yes, we
  // skip the count-up (the static value is already shown and a reset to 0
  // would flash).
  const wasInViewOnMount = React.useRef<boolean | null>(null);
  React.useEffect(() => {
    if (wasInViewOnMount.current !== null) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const inViewport =
      rect.top < window.innerHeight && rect.bottom > 0;
    wasInViewOnMount.current = inViewport;
    if (inViewport) {
      // already visible on load → keep the static value, no animation
      setDisplay(formatNumber(target, target));
    }
  }, [target]);

  React.useEffect(() => {
    if (!inView) return;
    if (wasInViewOnMount.current) {
      // element was in view on mount → no count-up, keep static
      return;
    }
    // element scrolled into view → run count-up
    let raf = 0;
    const controls = animate(0, target, {
      duration: 1.2,
      ease: [0.16, 1, 0.32, 1],
      onUpdate: (v) => setDisplay(formatNumber(v, target)),
    });
    return () => {
      controls.stop();
      cancelAnimationFrame(raf);
    };
  }, [inView, target]);

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
