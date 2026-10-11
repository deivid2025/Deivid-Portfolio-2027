"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  SiPostgresql,
  SiSupabase,
  SiDocker,
  SiPython,
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiAnthropic,
  SiClaudecode,
  SiTailwindcss,
  SiGit,
  SiGithub,
  SiVercel,
  SiKalilinux,
  SiWireshark,
  SiMetasploit,
  SiBurpsuite,
  SiHashcat,
  SiFlask,
  SiCursor,
  type IconType,
} from "react-icons/si";
import { BsOpenai } from "react-icons/bs";
import { useI18n } from "@/components/portfolio/i18n-provider";

// Custom VS Code SVG (Microsoft removed it from Simple Icons)
const VsCodeIcon: IconType = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.13a.999.999 0 0 0-1.276.07L.327 7.26a1 1 0 0 0-.001 1.47L3.91 11.9.327 15.26a1 1 0 0 0 .001 1.47l1.322 1.18a1 1 0 0 0 1.276.07l4.12-3.13 9.46 8.63a1.494 1.494 0 0 0 1.705.29l4.94-2.377a1.5 1.5 0 0 0 .84-1.35V3.937a1.5 1.5 0 0 0-.84-1.35zM17.5 17.22L10.6 11.9l6.9-5.32v10.64z" />
  </svg>
);

interface TechLogo {
  name: string;
  icon: IconType;
  color: string;
  category: "language" | "framework" | "database" | "devops" | "ai" | "security" | "editor";
}

const TECHS: TechLogo[] = [
  // Languages
  { name: "Python", icon: SiPython, color: "#3776AB", category: "language" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6", category: "language" },
  // Frameworks
  { name: "Next.js", icon: SiNextdotjs, color: "#FFFFFF", category: "framework" },
  { name: "React", icon: SiReact, color: "#61DAFB", category: "framework" },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "#06B6D4", category: "framework" },
  { name: "Flask", icon: SiFlask, color: "#FFFFFF", category: "framework" },
  // Databases
  { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1", category: "database" },
  { name: "Supabase", icon: SiSupabase, color: "#3FCF8E", category: "database" },
  // DevOps
  { name: "Docker", icon: SiDocker, color: "#2496ED", category: "devops" },
  { name: "Git", icon: SiGit, color: "#F05032", category: "devops" },
  { name: "GitHub", icon: SiGithub, color: "#FFFFFF", category: "devops" },
  { name: "Vercel", icon: SiVercel, color: "#FFFFFF", category: "devops" },
  { name: "Dokploy", icon: SiDocker, color: "#2496ED", category: "devops" },
  // Security / Ethical Hacking
  { name: "Kali Linux", icon: SiKalilinux, color: "#367BF0", category: "security" },
  { name: "Metasploit", icon: SiMetasploit, color: "#FFFFFF", category: "security" },
  { name: "Wireshark", icon: SiWireshark, color: "#1864B0", category: "security" },
  { name: "Burp Suite", icon: SiBurpsuite, color: "#FF6633", category: "security" },
  { name: "Hashcat", icon: SiHashcat, color: "#FFFFFF", category: "security" },
  // Editores & IA Code — los que más uso
  { name: "Cursor", icon: SiCursor, color: "#5850EC", category: "editor" },
  { name: "Claude Code", icon: SiClaudecode, color: "#D97757", category: "editor" },
  { name: "Codex", icon: BsOpenai, color: "#10A37F", category: "editor" },
  { name: "VS Code", icon: VsCodeIcon, color: "#0098FF", category: "editor" },
  // IA
  { name: "ChatGPT", icon: BsOpenai, color: "#10A37F", category: "ai" },
  { name: "Claude", icon: SiAnthropic, color: "#D97757", category: "ai" },
];

const CATEGORY_LABEL: Record<TechLogo["category"], string> = {
  language: "Lenguajes",
  framework: "Frameworks",
  database: "Base de datos",
  devops: "DevOps & Tools",
  editor: "Editores & IA Code",
  ai: "IA",
  security: "Ciberseguridad & Hacking Ético",
};

export function TechLogos() {
  const { t } = useI18n();
  const categories = Object.keys(CATEGORY_LABEL) as TechLogo["category"][];

  return (
    <section
      id="stack"
      className="scroll-mt-24 border-y border-border/40 bg-[#0d0d0d] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
            {t.stack.badge}
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t.stack.title}
          </h2>
          <p className="mt-2 max-w-2xl text-white/50">
            {t.stack.subtitle}
          </p>
        </motion.div>

        <div className="mt-10 space-y-10">
          {categories.map((cat, ci) => {
            const techs = TECHS.filter((t) => t.category === cat);
            if (techs.length === 0) return null;
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: ci * 0.08 }}
              >
                <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                  {CATEGORY_LABEL[cat]}
                </div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                  {techs.map((tech, i) => {
                    const Icon = tech.icon;
                    return (
                      <motion.div
                        key={tech.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: i * 0.04 }}
                        className="group relative flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
                      >
                        <Icon
                          className="h-8 w-8 transition-transform duration-300 group-hover:scale-110"
                          style={{ color: tech.color }}
                        />
                        <span className="text-[10px] font-medium text-white/50">
                          {tech.name}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
