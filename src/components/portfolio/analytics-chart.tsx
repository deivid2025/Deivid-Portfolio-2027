"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  ComposedChart,
} from "recharts";
import { Loader2, TrendingUp } from "lucide-react";

interface Bucket {
  date: string;
  label: string;
  messages: number;
  newViews: number;
}

interface AnalyticsData {
  days: number;
  totalViews: number;
  totalMessages: number;
  buckets: Bucket[];
}

async function fetchAnalytics(): Promise<AnalyticsData> {
  const res = await fetch("/api/admin/analytics", { cache: "no-store" });
  if (!res.ok) throw new Error("No autorizado");
  return res.json();
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-popover px-3 py-2 text-xs shadow-md">
      <div className="font-mono text-[10px] text-muted-foreground">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="mt-1 flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-foreground">
            {p.name === "messages" ? "Mensajes" : "Vistas (estimado)"}: {p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: fetchAnalytics,
    staleTime: 60_000,
    retry: 0,
  });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Cargando analytics…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        No se pudo cargar la actividad.
      </div>
    );
  }

  // Show ~every 5th label to avoid clutter.
  const chartData = data.buckets.map((b, i) => ({
    ...b,
    showLabel: i % 5 === 0 || i === data.buckets.length - 1,
  }));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {data.totalMessages} mensajes · {data.totalViews} vistas totales
        </span>
        <span className="inline-flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-primary" />
          {data.days} días
        </span>
      </div>
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 5, right: 8, bottom: 0, left: -16 }}
          >
            <defs>
              <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              strokeOpacity={0.1}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
              tickLine={false}
              axisLine={false}
              interval={(i: number) => i % 5 === 0 || i === chartData.length - 1}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="newViews"
              name="newViews"
              stroke="#10b981"
              strokeWidth={1.5}
              fill="url(#viewsGrad)"
              fillOpacity={1}
            />
            <Area
              type="monotone"
              dataKey="messages"
              name="messages"
              stroke="#f59e0b"
              strokeWidth={1.5}
              fill="url(#msgGrad)"
              fillOpacity={1}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-foreground" />
          Vistas (estimado/día)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-muted-foreground" />
          Mensajes nuevos
        </span>
      </div>
    </div>
  );
}
