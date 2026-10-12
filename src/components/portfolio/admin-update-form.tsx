"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Loader2, Save, Pencil, Plus, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface UpdateRow {
  slug: string;
  title: string;
  excerpt: string;
  body: string; // newline-separated
  date: string; // YYYY-MM-DD
  category: string;
  tags: string; // comma-separated
  project?: string | null;
  readTime: number;
}

interface Props {
  open: boolean;
  initial?: UpdateRow | null;
  onClose: () => void;
}

const CATEGORIES = [
  { value: "release", label: "Release" },
  { value: "devlog", label: "Devlog" },
  { value: "case-study", label: "Caso de estudio" },
  { value: "announcement", label: "Anuncio" },
];

const ACCENTS = [
  { value: "from-zinc-600 to-zinc-800", label: "Gris" },
  { value: "from-zinc-500 to-zinc-700", label: "Claro" },
  { value: "from-zinc-700 to-zinc-900", label: "Oscuro" },
  { value: "from-zinc-800 to-black", label: "Negro" },
];

export function UpdateFormDialog({ open, initial, onClose }: Props) {
  const qc = useQueryClient();
  const isEdit = !!initial;

  const [slug, setSlug] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [excerpt, setExcerpt] = React.useState("");
  const [body, setBody] = React.useState("");
  const [date, setDate] = React.useState("");
  const [category, setCategory] = React.useState("devlog");
  const [tags, setTags] = React.useState("");
  const [project, setProject] = React.useState("");
  const [readTime, setReadTime] = React.useState("2");

  React.useEffect(() => {
    if (open) {
      setSlug(initial?.slug ?? "");
      setTitle(initial?.title ?? "");
      setExcerpt(initial?.excerpt ?? "");
      setBody(initial?.body ?? "");
      setDate(
        initial?.date ??
          new Date().toISOString().slice(0, 10),
      );
      setCategory(initial?.category ?? "devlog");
      setTags(initial?.tags ?? "");
      setProject(initial?.project ?? "");
      setReadTime(String(initial?.readTime ?? 2));
    }
  }, [open, initial]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        slug: slug.trim(),
        title: title.trim(),
        excerpt: excerpt.trim(),
        body: body.trim(),
        date,
        category,
        tags: tags.trim(),
        project: project.trim() || null,
        readTime: Number(readTime) || 2,
      };
      if (isEdit) {
        const res = await fetch(`/api/admin/updates/${payload.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error ?? "No se pudo guardar");
        }
      } else {
        const res = await fetch("/api/admin/updates", {
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
      toast.success(isEdit ? "Update guardado" : "Update creado");
      qc.invalidateQueries({ queryKey: ["admin-updates"] });
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
                  Editar update
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 text-primary" />
                  Nuevo update
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isEdit
                ? "Modificá los campos y guardá."
                : "Completá los campos para publicar un nuevo post."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 pb-2 pt-4 sm:px-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Slug">
                <Input
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, ""),
                    )
                  }
                  placeholder="factusheet-nueva-feature"
                  disabled={isEdit}
                  className="font-mono text-sm"
                />
              </Field>
              <Field label="Fecha">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-sm"
                />
              </Field>
            </div>

            <Field label="Título">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="FactuSheet abre beta pública"
              />
            </Field>

            <Field label="Extracto">
              <Textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Resumen corto que aparece en la tarjeta del blog"
                className="min-h-[60px] resize-none"
              />
            </Field>

            <Field label="Cuerpo (un párrafo por línea vacía)">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={"Párrafo 1.\n\nPárrafo 2.\n\nPárrafo 3."}
                className="min-h-[140px] resize-y font-mono text-sm"
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Categoría">
                <Select value={category} onValueChange={setCategory}>
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
              <Field label="Proyecto relacionado">
                <Input
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="FactuSheet (opcional)"
                  className="text-sm"
                />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
              <Field label="Tags (separados por coma)">
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="FactuSheet, IA, beta"
                  className="font-mono text-sm"
                />
              </Field>
              <Field label="Tiempo de lectura (min)">
                <Input
                  type="number"
                  min={1}
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  className="text-sm"
                />
              </Field>
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
              disabled={save.isPending || !slug || !title}
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

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
