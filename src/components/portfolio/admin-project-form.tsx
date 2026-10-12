"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Pencil, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Field } from "@/components/portfolio/admin-update-form";
import {
  StructuredListEditor,
  StringListEditor,
} from "@/components/portfolio/structured-editors";

// Parsed shapes used by the structured editors.
type Feature = { title: string; description: string };
type Metric = { label: string; value: string };
type TechItem = { name: string; category: string };
type Highlights = string[];

const TECH_CATEGORIES = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "database", label: "Base de datos" },
  { value: "infra", label: "Infra" },
  { value: "ai", label: "IA" },
  { value: "tooling", label: "Tooling" },
];

export interface ProjectAdminRow {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  status: string;
  year: string;
  url: string;
  accent: string;
  icon: string;
  screenshot: string;
  summary: string;
  description: string;
  longDescription: string;
  features: string;
  metrics: string;
  techStack: string;
  highlights: string;
  audience: string;
}

interface Props {
  open: boolean;
  initial?: ProjectAdminRow | null;
  onClose: () => void;
}

const CATEGORIES = [
  { value: "Producto SaaS", label: "Producto SaaS" },
  { value: "E-commerce", label: "E-commerce" },
  { value: "Logística", label: "Logística" },
  { value: "Productividad IA", label: "Productividad IA" },
];

const STATUSES = [
  { value: "live", label: "En vivo" },
  { value: "beta", label: "Beta" },
  { value: "maintenance", label: "Mantenimiento" },
];

const ACCENTS = [
  { value: "from-zinc-600 via-zinc-700 to-zinc-900", label: "Gris" },
  { value: "from-rose-600 via-red-600 to-orange-600", label: "Rojo/Naranja" },
  { value: "from-zinc-500 via-zinc-600 to-zinc-700", label: "Claro" },
  { value: "from-zinc-800 via-zinc-900 to-black", label: "Oscuro" },
];

const ICONS = [
  { value: "Sticker", label: "Sticker" },
  { value: "Truck", label: "Truck (camión)" },
  { value: "FileScan", label: "FileScan (documento)" },
  { value: "Rocket", label: "Rocket (cohete)" },
  { value: "BrainCircuit", label: "BrainCircuit (IA)" },
  { value: "Zap", label: "Zap (rayo)" },
  { value: "Globe", label: "Globe (globo)" },
];

export function ProjectFormDialog({ open, initial, onClose }: Props) {
  const qc = useQueryClient();
  const isEdit = !!initial;

  const [form, setForm] = React.useState<ProjectAdminRow>({
    slug: "",
    name: "",
    tagline: "",
    category: "Producto SaaS",
    status: "live",
    year: String(new Date().getFullYear()),
    url: "",
    accent: "from-zinc-600 via-zinc-700 to-zinc-900",
    icon: "Rocket",
    screenshot: "/screenshots/despega-peelme.png",
    summary: "",
    description: "",
    longDescription: "",
    features: "[]",
    metrics: "[]",
    techStack: "[]",
    highlights: "[]",
    audience: "",
  });

  // Parsed array states for the structured editors.
  const [featuresArr, setFeaturesArr] = React.useState<Feature[]>([]);
  const [metricsArr, setMetricsArr] = React.useState<Metric[]>([]);
  const [techArr, setTechArr] = React.useState<TechItem[]>([]);
  const [highlightsArr, setHighlightsArr] = React.useState<Highlights>([]);

  const parseSafe = <T,>(s: string, fallback: T): T => {
    try {
      return JSON.parse(s) as T;
    } catch {
      return fallback;
    }
  };

  React.useEffect(() => {
    if (open) {
      const base = initial ?? {
        slug: "",
        name: "",
        tagline: "",
        category: "Producto SaaS",
        status: "live",
        year: String(new Date().getFullYear()),
        url: "",
        accent: "from-zinc-600 via-zinc-700 to-zinc-900",
        icon: "Rocket",
        screenshot: "/screenshots/despega-peelme.png",
        summary: "",
        description: "",
        longDescription: "",
        features: "[]",
        metrics: "[]",
        techStack: "[]",
        highlights: "[]",
        audience: "",
      };
      setForm(base);
      setFeaturesArr(parseSafe<Feature[]>(base.features, []));
      setMetricsArr(parseSafe<Metric[]>(base.metrics, []));
      setTechArr(parseSafe<TechItem[]>(base.techStack, []));
      setHighlightsArr(parseSafe<Highlights>(base.highlights, []));
    }
  }, [open, initial]);

  const update = (k: keyof ProjectAdminRow, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        slug: form.slug.trim(),
        name: form.name.trim(),
        features: JSON.stringify(featuresArr.filter((f) => f.title.trim())),
        metrics: JSON.stringify(metricsArr.filter((m) => m.label.trim())),
        techStack: JSON.stringify(techArr.filter((t) => t.name.trim())),
        highlights: JSON.stringify(highlightsArr.filter((h) => h.trim())),
      };
      if (isEdit) {
        const res = await fetch(`/api/admin/projects/${payload.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error ?? "No se pudo guardar");
        }
      } else {
        const res = await fetch("/api/admin/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error ?? "No se pudo crear");
        }
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? "Proyecto guardado" : "Proyecto creado");
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-hidden p-0">
        <div className="max-h-[92vh] overflow-y-auto scrollbar-thin">
          <DialogHeader className="px-5 pt-5 sm:px-6">
            <DialogTitle className="flex items-center gap-2">
              {isEdit ? (
                <>
                  <Pencil className="h-4 w-4 text-primary" />
                  Editar proyecto
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 text-primary" />
                  Nuevo proyecto
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isEdit
                ? "Modificá los campos y guardá."
                : "Completá los campos para añadir una nueva app al portfolio."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 pb-2 pt-4 sm:px-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Slug">
                <Input
                  value={form.slug}
                  onChange={(e) =>
                    update(
                      "slug",
                      e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, ""),
                    )
                  }
                  placeholder="mi-nueva-app"
                  disabled={isEdit}
                  className="font-mono text-sm"
                />
              </Field>
              <Field label="Año">
                <Input
                  value={form.year}
                  onChange={(e) => update("year", e.target.value)}
                  className="text-sm"
                />
              </Field>
            </div>

            <Field label="Nombre">
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Mi Nueva App"
              />
            </Field>

            <Field label="Tagline">
              <Input
                value={form.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                placeholder="Una frase que describa el proyecto"
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Categoría">
                <Select
                  value={form.category}
                  onValueChange={(v) => update("category", v)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Estado">
                <Select
                  value={form.status}
                  onValueChange={(v) => update("status", v)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="URL (producción)">
              <Input
                value={form.url}
                onChange={(e) => update("url", e.target.value)}
                placeholder="https://app.deividtech.cloud/"
                className="text-sm"
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Gradiente (cover)">
                <Select
                  value={form.accent}
                  onValueChange={(v) => update("accent", v)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCENTS.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Icono">
                <Select
                  value={form.icon}
                  onValueChange={(v) => update("icon", v)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICONS.map((i) => (
                      <SelectItem key={i.value} value={i.value}>
                        {i.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Screenshot (path)">
                <Input
                  value={form.screenshot}
                  onChange={(e) => update("screenshot", e.target.value)}
                  placeholder="/screenshots/mi-app.png"
                  className="font-mono text-xs"
                />
              </Field>
            </div>

            <Field label="Resumen corto (card)">
              <Textarea
                value={form.summary}
                onChange={(e) => update("summary", e.target.value)}
                placeholder="Aparece en la tarjeta del proyecto."
                className="min-h-[60px] resize-none"
              />
            </Field>

            <Field label="Descripción (corta)">
              <Textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Descripción media para el modal."
                className="min-h-[60px] resize-none"
              />
            </Field>

            <Field label="Descripción larga (modal)">
              <Textarea
                value={form.longDescription}
                onChange={(e) => update("longDescription", e.target.value)}
                placeholder="Descripción profesional completa."
                className="min-h-[100px] resize-y"
              />
            </Field>

            <Field label="Audiencia (para quién es)">
              <Input
                value={form.audience}
                onChange={(e) => update("audience", e.target.value)}
                placeholder="Contadores, PyMEs, equipos..."
              />
            </Field>

            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
              <strong className="text-primary">
                Contenido estructurado:
              </strong>{" "}
              features, métricas, tech stack y highlights se editan con
              botones de agregar/quitar. No necesitás escribir JSON.
            </div>

            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">
                Features (funcionalidades clave)
              </Label>
              <StructuredListEditor
                fields={[
                  { key: "title", label: "Título", type: "text", placeholder: "Extracción con IA" },
                  { key: "description", label: "Descripción", type: "text", placeholder: "Lee proveedor, RUC, items...", span: 2 },
                ]}
                value={featuresArr}
                onChange={setFeaturesArr}
                itemLabel="Feature"
              />
            </div>

            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">
                Métricas
              </Label>
              <StructuredListEditor
                fields={[
                  { key: "label", label: "Label", type: "text", placeholder: "Tiempo por factura" },
                  { key: "value", label: "Valor", type: "text", placeholder: "10s" },
                ]}
                value={metricsArr}
                onChange={setMetricsArr}
                itemLabel="Métrica"
              />
            </div>

            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">
                Tech stack
              </Label>
              <StructuredListEditor
                fields={[
                  { key: "name", label: "Nombre", type: "text", placeholder: "Next.js" },
                  { key: "category", label: "Categoría", type: "select", options: TECH_CATEGORIES },
                ]}
                value={techArr}
                onChange={setTechArr}
                itemLabel="Tech"
              />
            </div>

            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">
                Highlights (bullets en la card)
              </Label>
              <StringListEditor
                value={highlightsArr}
                onChange={setHighlightsArr}
                itemLabel="Highlight"
                placeholder="OCR + IA para facturas"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-card/40 px-5 py-3 sm:px-6">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-full"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="h-9 rounded-full"
              disabled={save.isPending || !form.slug || !form.name}
              onClick={() => save.mutate()}
            >
              {save.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-3.5 w-3.5" />
              )}
              {isEdit ? "Guardar" : "Crear"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
