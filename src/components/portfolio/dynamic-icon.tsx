"use client";

import * as React from "react";
import {
  Sticker,
  Truck,
  FileScan,
  Rocket,
  BrainCircuit,
  Zap,
  Globe,
  Search,
  FileText,
  Code2,
  Github,
  ShieldCheck,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Sticker,
  Truck,
  FileScan,
  Rocket,
  BrainCircuit,
  Zap,
  Globe,
  Search,
  FileText,
  Code2,
  Github,
  ShieldCheck,
  Dumbbell,
};

export function DynamicIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = MAP[name] ?? Rocket;
  return <Icon className={className} />;
}
