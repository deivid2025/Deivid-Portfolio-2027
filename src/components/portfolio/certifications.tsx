"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Award,
  ExternalLink,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface Certification {
  title: string;
  organization: string;
  year: string;
  hours?: string;
  image: string;
  category: "security" | "development" | "other";
}

const CERTS: Certification[] = [
  {
    title: "Kali Linux · Seguridad Informática · Pentesting · Hacking",
    organization: "Udemy",
    year: "2022",
    image: "/certs/cert-kali-linux.png",
    category: "security",
  },
  {
    title: "Hacking Ético Ofensivo · 100% Práctico en Red Team",
    organization: "Udemy · Universidad Hacking",
    year: "2022",
    hours: "41 horas",
    image: "/certs/cert-hacking-etico-redteam.png",
    category: "security",
  },
  {
    title: "Hacking Ético Ofensivo · Red Team (Edición 2022)",
    organization: "Udemy · Universidad Hacking",
    year: "2022",
    hours: "41 horas",
    image: "/certs/cert-hacking-etico-redteam-2.png",
    category: "security",
  },
  {
    title: "Firewall: pfSense · Instalación y Configuración con Práctica",
    organization: "Udemy",
    year: "2022",
    hours: "6.5 horas",
    image: "/certs/cert-pfsense-firewall.png",
    category: "security",
  },
  {
    title: "Introduction to Front-End Development",
    organization: "Meta · Coursera",
    year: "2023",
    image: "/certs/cert-frontend-meta.png",
    category: "development",
  },
  {
    title: "Curso Completo de Flask con Python y Creación de API REST",
    organization: "Udemy",
    year: "2024",
    image: "/certs/cert-flask-python.png",
    category: "development",
  },
  {
    title: "Automatiza tu Marketing Digital",
    organization: "Udemy",
    year: "2022",
    hours: "1.5 horas",
    image: "/certs/cert-marketing-digital.png",
    category: "other",
  },
];

const CATEGORY_STYLE: Record<Certification["category"], string> = {
  security: "border-foreground/30 bg-foreground/5 text-foreground",
  development: "border-primary/30 bg-primary/5 text-primary",
  other: "border-muted-foreground/30 bg-muted/30 text-muted-foreground",
};

const CATEGORY_LABEL: Record<Certification["category"], string> = {
  security: "Ciberseguridad",
  development: "Desarrollo",
  other: "Otros",
};

export function Certifications() {
  const [selected, setSelected] = React.useState<Certification | null>(null);

  return (
    <section
      id="certs"
      className="scroll-mt-24 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Certificaciones & Cursos
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Formación & Certificados
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Cursos y certificaciones en ciberseguridad, hacking ético,
            desarrollo web y Python. Formación continua, siempre aprendiendo.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CERTS.map((cert, i) => (
            <motion.button
              key={cert.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              onClick={() => setSelected(cert)}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/50 text-left backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              {/* Certificate image preview */}
              <div className="relative h-40 overflow-hidden border-b border-border/40 bg-muted/20">
                <img
                  src={cert.image}
                  alt={cert.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
                <div
                  className={`absolute right-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-medium backdrop-blur ${CATEGORY_STYLE[cert.category]}`}
                >
                  {CATEGORY_LABEL[cert.category]}
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start gap-2">
                  <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold leading-snug line-clamp-2">
                      {cert.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {cert.organization}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{cert.year}</span>
                      {cert.hours && (
                        <>
                          <span>·</span>
                          <span>{cert.hours}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Ver certificado
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Full certificate modal */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          {selected && (
            <div className="relative">
              <div className="flex items-center justify-between border-b border-border/60 bg-card/40 px-5 py-3">
                <DialogTitle className="text-sm font-semibold">
                  {selected.title}
                </DialogTitle>
                <span className="text-xs text-muted-foreground">
                  {selected.organization} · {selected.year}
                  {selected.hours && ` · ${selected.hours}`}
                </span>
              </div>
              <div className="max-h-[75vh] overflow-auto scrollbar-thin">
                <img
                  src={selected.image}
                  alt={selected.title}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
