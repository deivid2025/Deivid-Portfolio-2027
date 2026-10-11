"use client";

import * as React from "react";
import { motion } from "framer-motion";

// Deterministic pseudo-random generator so the graph is stable across renders.
function seeded(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const WEEKS = 53; // full year like GitHub
const DAYS = 7;

interface Cell {
  level: 0 | 1 | 2 | 3 | 4;
  date: Date;
}

// GitHub-style level colors in monochrome (white/gray on dark)
const LEVEL_BG: Record<Cell["level"], string> = {
  0: "bg-[#1a1a1a]",      // empty — very dark
  1: "bg-[#2a2a2a]",      // low — dark gray
  2: "bg-[#4a4a4a]",      // medium — medium gray
  3: "bg-[#8a8a8a]",      // high — light gray
  4: "bg-[#e8e8e8]",      // max — bright white
};

// GitHub-style tooltip colors
const LEVEL_LABEL: Record<Cell["level"], string> = {
  0: "No contributions",
  1: "Low",
  2: "Moderate",
  3: "High",
  4: "Very high",
};

function buildGrid(): Cell[][] {
  const rand = seeded(42);
  const today = new Date();
  const start = new Date(today);
  // Go back to the first day of the week (Sunday) ~53 weeks ago
  start.setDate(today.getDate() - (WEEKS - 1) * 7 - today.getDay());

  const grid: Cell[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    const week: Cell[] = [];
    for (let d = 0; d < DAYS; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const weekend = d === 0 || d === 6;
      const recencyBoost = w / WEEKS;
      const r = rand();
      let level: Cell["level"] = 0;
      const threshold = 0.4 + (weekend ? 0.2 : 0) - recencyBoost * 0.1;
      if (r < threshold) level = 0;
      else if (r < threshold + 0.25) level = 1;
      else if (r < threshold + 0.45) level = 2;
      else if (r < threshold + 0.58) level = 3;
      else level = 4;
      week.push({ level, date });
    }
    grid.push(week);
  }
  return grid;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export function ContributionGraph() {
  const grid = React.useMemo(() => buildGrid(), []);

  const totalCommits = React.useMemo(
    () =>
      grid
        .flat()
        .reduce((acc, c) => acc + (c.level > 0 ? c.level * 4 + 2 : 0), 0),
    [grid],
  );

  // Find which weeks are the start of each month for labels
  const monthMarkers = React.useMemo(() => {
    const markers: { week: number; label: string }[] = [];
    let lastMonth = -1;
    grid.forEach((week, w) => {
      const firstDay = week[0].date;
      const month = firstDay.getMonth();
      if (month !== lastMonth) {
        markers.push({ week: w, label: MONTH_LABELS[month] });
        lastMonth = month;
      }
    });
    return markers;
  }, [grid]);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur sm:p-5">
      {/* Header — identical to GitHub */}
      <div className="mb-3 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{totalCommits}</span> contributions in the last year
      </div>

      {/* Scrollable graph */}
      <div className="overflow-x-auto scrollbar-thin">
        <div className="inline-flex flex-col gap-1">
          {/* Month labels row */}
          <div className="flex gap-[3px] pl-8 text-[10px] text-muted-foreground" style={{ height: "16px" }}>
            {grid.map((_, w) => {
              const marker = monthMarkers.find((m) => m.week === w);
              return (
                <div
                  key={w}
                  className="w-[11px]"
                  style={{ lineHeight: "16px" }}
                >
                  {marker ? marker.label : ""}
                </div>
              );
            })}
          </div>

          {/* Grid + day labels */}
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] pr-1 text-[9px] text-muted-foreground">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="w-7"
                  style={{ height: "11px", lineHeight: "11px" }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div className="flex gap-[3px]">
              {grid.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((cell, di) => (
                    <motion.div
                      key={`${wi}-${di}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.1,
                        delay: (wi * 7 + di) * 0.002,
                      }}
                      className={`h-[11px] w-[11px] rounded-[2px] ${LEVEL_BG[cell.level]}`}
                      title={`${LEVEL_LABEL[cell.level]} on ${formatDate(cell.date)}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend — identical to GitHub */}
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
        <span>Less</span>
        <div className={`h-[10px] w-[10px] rounded-[2px] ${LEVEL_BG[0]}`} />
        <div className={`h-[10px] w-[10px] rounded-[2px] ${LEVEL_BG[1]}`} />
        <div className={`h-[10px] w-[10px] rounded-[2px] ${LEVEL_BG[2]}`} />
        <div className={`h-[10px] w-[10px] rounded-[2px] ${LEVEL_BG[3]}`} />
        <div className={`h-[10px] w-[10px] rounded-[2px] ${LEVEL_BG[4]}`} />
        <span>More</span>
      </div>
    </div>
  );
}
