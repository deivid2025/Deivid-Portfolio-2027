"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { useI18n } from "@/components/portfolio/i18n-provider";

interface ViewsResponse {
  slug: string;
  views: number;
}

async function fetchViews(slug: string): Promise<number> {
  const res = await fetch(`/api/projects/${slug}/view`, {
    cache: "no-store",
  });
  if (!res.ok) return 0;
  const data = (await res.json()) as ViewsResponse;
  return data.views ?? 0;
}

async function incrementViews(slug: string): Promise<number> {
  const res = await fetch(`/api/projects/${slug}/view`, { method: "POST" });
  if (!res.ok) return 0;
  const data = (await res.json()) as ViewsResponse;
  return data.views ?? 0;
}

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function ProjectViews({ slug }: { slug: string }) {
  const { t } = useI18n();
  const { data } = useQuery({
    queryKey: ["project-views", slug],
    queryFn: () => fetchViews(slug),
    staleTime: 30_000,
  });
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
      <Eye className="h-3 w-3" />
      {formatViews(data ?? 0)} {t.projects.views}
    </span>
  );
}

// Fire-and-forget incrementer used when a project modal opens.
export function useIncrementProjectViews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => incrementViews(slug),
    onSuccess: (_data, slug) => {
      // optimistically refresh the cached count for that slug
      qc.invalidateQueries({ queryKey: ["project-views", slug] });
    },
  });
}
