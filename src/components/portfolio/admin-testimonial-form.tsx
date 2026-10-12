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
import { Loader2, Save, Pencil, Plus, Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Field } from "@/components/portfolio/admin-update-form";

export interface TestimonialRow {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  avatarInitials: string;
  accent: string;
  project?: string | null;
}

interface Props {
  open: boolean;
  initial?: TestimonialRow | null;
  onClose: () => void;
}

const ACCENTS = [
  { value: "from-zinc-600 to-zinc-800", label: "Zinc" },
  { value: "from-zinc-500 to-zinc-700", label: "Gris" },
  { value: "from-zinc-700 to-zinc-900", label: "Oscuro" },
  { value: "from-zinc-800 to-black", label: "Negro" },
  { value: "from-zinc-500 to-zinc-700", label: "Gris" },
];

export function TestimonialFormDialog({ open, initial, onClose }: Props) {
  const qc = useQueryClient();
  const isEdit = !!initial;

  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [quote, setQuote] = React.useState("");
  const [rating, setRating] = React.useState("5");
  const [avatarInitials, setAvatarInitials] = React.useState("");
  const [accent, setAccent] = React.useState("from-zinc-600 to-zinc-800");
  const [project, setProject] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setRole(initial?.role ?? "");
      setCompany(initial?.company ?? "");
      setQuote(initial?.quote ?? "");
      setRating(String(initial?.rating ?? 5));
      setAvatarInitials(initial?.avatarInitials ?? "");
      setAccent(initial?.accent ?? "from-zinc-600 to-zinc-800");
      setProject(initial?.project ?? "");
    }
  }, [open, initial]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        role: role.trim(),
        company: company.trim(),
        quote: quote.trim(),
        rating: Number(rating) || 5,
        avatarInitials: (avatarInitials || name.slice(0, 2).toUpperCase()).toUpperCase(),
        accent,
        project: project.trim() || null,
      };
      if (isEdit) {
        const res = await fetch(`/api/admin/testimonials/${initial!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error ?? "No se pudo guardar");
        }
      } else {
        const res = await fetch("/api/admin/testimonials", {
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
      toast.success(isEdit ? "Testimonio guardado" : "Testimonio creado");
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
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
                  Editar testimonio
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 text-primary" />
                  Nuevo testimonio
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Aparecerá en el carrusel de testimonios de la home.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 pb-2 pt-4 sm:px-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nombre">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Carolina Méndez"
                />
              </Field>
              <Field label="Iniciales del avatar">
                <Input
                  value={avatarInitials}
                  onChange={(e) => setAvatarInitials(e.target.value)}
                  placeholder="CM (auto si vacío)"
                  maxLength={3}
                  className="font-mono uppercase"
                />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Rol">
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Contadora"
                />
              </Field>
              <Field label="Empresa">
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Estudio CM"
                />
              </Field>
            </div>

            <Field label="Testimonio (quote)">
              <Textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="El testimonio completo entre comillas."
                className="min-h-[100px] resize-none"
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Rating">
                <Select value={rating} onValueChange={setRating}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {n === 1 ? "estrella" : "estrellas"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Color del avatar">
                <Select value={accent} onValueChange={setAccent}>
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
              <Field label="Proyecto (opcional)">
                <Input
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="FactuSheet"
                  className="text-sm"
                />
              </Field>
            </div>

            {quote && (
              <div className="rounded-xl border border-border/60 bg-card/50 p-4">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Preview
                </div>
                <div className="mt-2 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < Number(rating)
                          ? "h-4 w-4 fill-foreground text-foreground"
                          : "h-4 w-4 text-muted-foreground/40"
                      }
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                  “{quote}”
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${accent}`}
                  >
                    {(avatarInitials || name.slice(0, 2) || "?").toUpperCase()}
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold">{name || "Nombre"}</div>
                    <div className="text-muted-foreground">
                      {role || "Rol"}
                      {project ? ` · ${project}` : ""}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              disabled={save.isPending || !name || !quote}
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
