"use client";

import * as React from "react";

/**
 * Returns props for a 3D tilt effect that follows the mouse position.
 * The transform state is separate from the ref so the linter doesn't flag it.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(maxTilt = 8) {
  const ref = React.useRef<T>(null);
  const [transform, setTransform] = React.useState("");
  const [glare, setGlare] = React.useState<{ x: number; y: number; o: number }>(
    { x: 50, y: 50, o: 0 },
  );

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<T>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = x / rect.width;
      const py = y / rect.height;
      const rotateX = (0.5 - py) * maxTilt * 2;
      const rotateY = (px - 0.5) * maxTilt * 2;
      setTransform(
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
      );
      setGlare({ x: px * 100, y: py * 100, o: 0.12 });
    },
    [maxTilt],
  );

  const handleMouseLeave = React.useCallback(() => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)");
    setGlare((g) => ({ ...g, o: 0 }));
  }, []);

  const tiltStyle: React.CSSProperties = {
    transform,
    transition: "transform 0.2s ease-out",
  };

  const glareStyle: React.CSSProperties = {
    background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.o}) 0%, transparent 50%)`,
  };

  return {
    ref,
    handleMouseMove,
    handleMouseLeave,
    tiltStyle,
    glareStyle,
  };
}
