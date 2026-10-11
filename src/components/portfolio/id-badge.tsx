"use client";

import * as React from "react";
import { motion, useSpring } from "framer-motion";
import { profile } from "@/lib/projects";
import {
  SiReact,
  SiNextdotjs,
  SiPython,
  SiDocker,
  SiKalilinux,
  SiSupabase,
  SiPostgresql,
  SiTypescript,
  SiMetasploit,
  SiBurpsuite,
  type IconType,
} from "react-icons/si";

export function IdBadge() {
  const [settled, setSettled] = React.useState(false);

  const dropY = useSpring(-700, {
    stiffness: 80,
    damping: 12,
    mass: 1.2,
  });

  const swing = React.useRef(0);
  const swingSpring = useSpring(swing, {
    stiffness: 40,
    damping: 6,
    mass: 1.5,
  });

  React.useEffect(() => {
    const drop = async () => {
      await new Promise((r) => setTimeout(r, 400));
      dropY.set(0);
      setTimeout(() => {
        setSettled(true);
        swing.current = 3;
        swingSpring.set(3);
        setTimeout(() => { swingSpring.set(-2.5); }, 800);
        setTimeout(() => { swingSpring.set(1.5); }, 1600);
        setTimeout(() => { swingSpring.set(-1); }, 2400);
        setTimeout(() => { swingSpring.set(0.5); }, 3200);
        setTimeout(() => { swingSpring.set(0); }, 4000);
      }, 1500);
    };
    drop();
  }, [dropY, swingSpring]);

  const devLogos: { icon: IconType; color: string }[] = [
    { icon: SiReact, color: "#61DAFB" },
    { icon: SiNextdotjs, color: "#000000" },
    { icon: SiTypescript, color: "#3178C6" },
    { icon: SiPython, color: "#3776AB" },
    { icon: SiDocker, color: "#2496ED" },
    { icon: SiSupabase, color: "#3FCF8E" },
    { icon: SiPostgresql, color: "#4169E1" },
  ];

  const secLogos: { icon: IconType; color: string }[] = [
    { icon: SiKalilinux, color: "#367BF0" },
    { icon: SiMetasploit, color: "#000000" },
    { icon: SiBurpsuite, color: "#FF6633" },
  ];

  return (
    <motion.div
      style={{
        y: dropY,
        rotate: settled ? swingSpring : 0,
        transformOrigin: "top center",
      }}
      className="flex flex-col items-center"
    >
      {/* Lanyard — grey woven fabric */}
      <div
        className="h-24 w-2.5 rounded-b-sm"
        style={{
          background: "linear-gradient(180deg, #6B7280 0%, #4B5563 100%)",
        }}
      />

      {/* Silver lobster clasp */}
      <div className="-mb-1 flex flex-col items-center">
        <div
          className="h-5 w-5 rounded-full"
          style={{
            background: "linear-gradient(135deg, #d1d5db, #9ca3af, #d1d5db)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        />
        <div className="-mt-1 h-3 w-4 rounded-sm bg-gradient-to-b from-zinc-400 to-zinc-600" />
      </div>

      {/* === CARD === */}
      <div className="relative" style={{ transform: "rotate(-3deg)" }}>
        {/* Shadow card behind */}
        <div
          className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-xl bg-black"
          style={{ zIndex: 0 }}
        />

        {/* Main card */}
        <div
          className="relative w-64 overflow-hidden rounded-xl bg-white"
          style={{
            zIndex: 1,
            boxShadow: "0 20px 60px -10px rgba(0,0,0,0.35)",
          }}
        >
          {/* Grid paper background */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
          />

          {/* Top accent bar */}
          <div className="relative h-2 w-full bg-black" />

          {/* === Photo section === */}
          <div className="relative flex justify-center pt-6">
            <div
              className="relative h-20 w-20 overflow-hidden rounded-full border-[3px] border-zinc-200"
              style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                background: "#38BDF8",
              }}
            >
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* === Name + role === */}
          <div className="relative px-6 pt-3 pb-4 text-center">
            <h3
              className="text-lg font-bold tracking-tight text-black"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              {profile.name}
            </h3>
            <div className="mt-1 flex flex-col items-center gap-0.5">
              <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-zinc-500">
                Developer
              </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-zinc-500">
                {profile.brand}
              </span>
            </div>
          </div>

          {/* === Divider === */}
          <div className="mx-6 h-px w-full bg-zinc-100" />

          {/* === Dev logos row === */}
          <div className="relative flex flex-wrap items-center justify-center gap-2.5 px-6 py-3">
            {devLogos.map((l, i) => {
              const Icon = l.icon;
              return (
                <Icon
                  key={i}
                  className="h-4 w-4"
                  style={{ color: l.color }}
                />
              );
            })}
          </div>

          {/* === Security logos row === */}
          <div className="relative flex items-center justify-center gap-2.5 px-6 pb-3">
            {secLogos.map((l, i) => {
              const Icon = l.icon;
              return (
                <Icon
                  key={i}
                  className="h-3.5 w-3.5"
                  style={{ color: l.color }}
                />
              );
            })}
          </div>

          {/* === Bottom branding === */}
          <div className="relative mx-6 mb-5 mt-1 flex items-center justify-between">
            {/* Oval stamp */}
            <div
              className="flex h-7 items-center gap-1 rounded-full border-2 border-black px-2"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
              </svg>
              <span className="text-[7px] font-bold uppercase text-black">
                {profile.location.split(" · ")[0]}
              </span>
            </div>

            {/* Black pill sticker */}
            <div className="rounded-full bg-black px-2.5 py-1">
              <span className="text-[7px] font-semibold uppercase tracking-wide text-white">
                Engineering
              </span>
            </div>
          </div>

          {/* === Barcode === */}
          <div className="flex h-6 items-center justify-center gap-px border-t border-zinc-100 bg-zinc-50">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="bg-zinc-800"
                style={{
                  width: i % 3 === 0 ? "2px" : "1px",
                  height: i % 2 === 0 ? "75%" : "50%",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
