"use client";

import * as React from "react";
import dynamic from "next/dynamic";

const Lanyard = dynamic(() => import("./lanyard/Lanyard"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[280px] w-full items-center justify-center sm:h-[400px] lg:h-[500px]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
    </div>
  ),
});

export function IdBadge() {
  return (
    <div className="h-[280px] w-full sm:h-[400px] lg:h-[500px]">
      <Lanyard
        frontImage="/card-front.png"
        cardColor="#16171c"
        orientation="portrait"
        finish="matte"
        cornerRadius={0.15}
        size={0.65}
        anchor="center"
        strapLength={0.4}
        strapColor="#1a1a1a"
        metal="graphite"
        gravity={1}
        damping={0.5}
        elasticity={0.5}
        breeze={0.3}
        interactive={true}
        intro={true}
      />
    </div>
  );
}
