// Static portfolio data for Deivid Tech projects.
// In a future iteration these records could be persisted in Prisma, but for now
// a typed in-memory dataset keeps the portfolio fast and dependency-free.

export type ProjectStatus = "live" | "beta" | "maintenance";

export interface TechItem {
  name: string;
  category: "frontend" | "backend" | "database" | "infra" | "ai" | "tooling";
}

export interface ProjectFeature {
  title: string;
  description: string;
}

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  category: "Producto SaaS" | "E-commerce" | "Productividad IA" | "Logística";
  status: ProjectStatus;
  year: string;
  url: string;
  accent: string; // tailwind gradient classes for the cover art
  icon: string; // lucide icon name resolved on the client
  screenshot: string; // path under /public/screenshots
  summary: string;
  description: string;
  longDescription: string;
  features: ProjectFeature[];
  metrics: ProjectMetric[];
  techStack: TechItem[];
  highlights: string[];
  audience: string;
}

export const projects: Project[] = [
  {
    slug: "despega-peelme",
    name: "DESPEGA! — PeelMe",
    tagline: "Stickers troquelados personalizados con efecto peel",
    category: "E-commerce",
    status: "live",
    year: "2025",
    url: "https://peelme.deividtech.cloud/",
    accent: "from-zinc-700 via-zinc-800 to-zinc-900",
    icon: "Sticker",
    screenshot: "/screenshots/despega-peelme.png",
    summary:
      "Convertí una frase o comentario en un sticker troquelado que se despega en pantalla y en tu cuaderno. Packs digitales y físicos entregados por DM en 24 horas.",
    description:
      "Plataforma de stickers personalizados con un laboratorio interactivo donde el usuario diseña su sticker en tiempo real: tipo, estilo, troquel, material y sonido, y recibe un ZIP con 10 PNG + 10 stickers listos para WhatsApp.",
    longDescription:
      "DESPEGA! es un producto creativo-conversional que convierte comentarios de TikTok en stickers troquelados. El núcleo es un laboratorio web interactivo que renderiza el sticker en vivo y permite elegir entre 15 troqueles, 4 materiales (original, láser/holográfico, resplandecer y película reflectante), 12 estilos tipográficos y sonido de despegue. El cliente recibe un ZIP con PNG troquelado, video peel y guía de instalación en menos de 24 horas, todo entregado por DM. Incluye catálogo de nichos (parejas, mascotas, negocios locales, beauty, gym, astro, gaming, eventos), SEO optimizado, y soporte multi-idioma ES/PT.",
    features: [
      {
        title: "Laboratorio interactivo",
        description:
          "Editor en tiempo real con 15 troqueles, 12 estilos tipográficos y 4 materiales que se renderizan en canvas antes de pedir.",
      },
      {
        title: "Catálogo de nichos",
        description:
          "8 nichos pre-cargados (parejas, mascotas, negocios locales, beauty, gym, astro, gaming, eventos) con frases que ya convierten.",
      },
      {
        title: "Entrega por DM en 24h",
        description:
          "Workflow conversacional: el usuario comenta una frase en TikTok y recibe el ZIP final por DM, sin cuenta ni checkout pesado.",
      },
      {
        title: "Colección local en navegador",
        description:
          "Los stickers diseñados se guardan en el navegador del usuario, sin servidores ni cuentas, respetando privacidad.",
      },
    ],
    metrics: [
      { label: "Nichos activos", value: "8" },
      { label: "Troqueles", value: "15" },
      { label: "Estilos tipográficos", value: "12" },
      { label: "Tiempo de entrega", value: "24h" },
    ],
    techStack: [
      { name: "Next.js", category: "frontend" },
      { name: "React", category: "frontend" },
      { name: "TypeScript", category: "frontend" },
      { name: "Tailwind CSS", category: "frontend" },
      { name: "Canvas API", category: "frontend" },
      { name: "Docker", category: "infra" },
      { name: "Vercel", category: "infra" },
      { name: "ChatGPT", category: "ai" },
    ],
    highlights: [
      "Laboratorio de stickers en tiempo real",
      "Entrega conversacional por DM",
      "SEO optimizado",
    ],
    audience:
      "Negocios, equipos, parejas y fans que quieren merch personalizado sin diseñador ni Photoshop.",
  },
  {
    slug: "redline",
    name: "Redline",
    tagline: "Plataforma de control operativo y financiero para flotas de volcadores",
    category: "Logística",
    status: "live",
    year: "2025",
    url: "https://redline.deividtech.cloud/auth",
    accent: "from-zinc-600 via-zinc-700 to-zinc-800",
    icon: "Truck",
    screenshot: "/screenshots/redline.png",
    summary:
      "Sistema de gestión logística para flotas de volcadores: viajes, ingresos, rendimiento de flota y control financiero en tiempo real.",
    description:
      "Plataforma operativa que unifica la gestión de viajes, ingresos y rendimiento de la flota de volcadores, con tableros en tiempo real y control financiero integral.",
    longDescription:
      "Redline es un sistema de gestión logística y financiero diseñado para flotas de camiones volcadores. Centraliza el control operativo —alta y seguimiento de viajes, asignación de choferes y unidades, estados en tiempo real— y lo combina con el control financiero: ingresos por viaje, rendimiento de flota, indicadores de productividad y rentabilidad. Incluye autenticación, roles y un dashboard ejecutivo que permite a los administradores tomar decisiones en base a datos vivos en lugar de planillas sueltas.",
    features: [
      {
        title: "Gestión de viajes",
        description:
          "Alta, edición y seguimiento de cada viaje con origen, destino, chofer, unidad y estado en tiempo real.",
      },
      {
        title: "Control financiero",
        description:
          "Ingresos por viaje, costos, rentabilidad y rendimiento de flota consolidados en un tablero ejecutivo.",
      },
      {
        title: "Rendimiento de flota",
        description:
          "Indicadores por unidad y chofer para detectar cuellos de botella y optimizar la operación.",
      },
      {
        title: "Autenticación y roles",
        description:
          "Acceso protegido con login y permisos diferenciados por perfil de usuario.",
      },
      {
        title: "Dashboard ejecutivo",
        description:
          "Vista consolidada de KPIs operativos y financieros para decisiones rápidas.",
      },
    ],
    metrics: [
      { label: "Módulos", value: "5+" },
      { label: "Tiempo real", value: "Sí" },
      { label: "Roles", value: "Multi" },
      { label: "Año", value: "2025" },
    ],
    techStack: [
      { name: "React", category: "frontend" },
      { name: "TypeScript", category: "frontend" },
      { name: "Tailwind CSS", category: "frontend" },
      { name: "Supabase", category: "backend" },
      { name: "PostgreSQL", category: "database" },
      { name: "Docker", category: "infra" },
      { name: "Auth", category: "backend" },
      { name: "Realtime", category: "infra" },
    ],
    highlights: [
      "Tablero operativo y financiero unificado",
      "Seguimiento de flota en tiempo real",
      "Control de ingresos por viaje",
      "Autenticación con roles",
    ],
    audience:
      "Empresarios y administradores de flotas de volcadores que necesitan visibilidad operativa y financiera en una sola plataforma.",
  },
  {
    slug: "factusheet-oboroscan",
    name: "FactuSheet",
    tagline: "Facturas con IA para contadores y PyMEs, directo a Google Sheets",
    category: "Productividad IA",
    status: "beta",
    year: "2026",
    url: "https://oboroscan-app.deividtech.cloud/",
    accent: "from-zinc-500 via-zinc-600 to-zinc-700",
    icon: "FileScan",
    screenshot: "/screenshots/factusheet-oboroscan.png",
    summary:
      "Escaneá facturas, recibos y comprobantes con IA. Extraé proveedor, RUC, items y totales, y enviá los datos a tu Google Sheet en 10 segundos.",
    description:
      "Herramienta de OCR + IA que convierte fotos de facturas en filas de planilla, con detección de duplicados y export a Google Sheets o CSV.",
    longDescription:
      "FactuSheet es una herramienta de productividad IA pensada para contadores, estudios contables, abogados, administradores y PyMEs que procesan volumen de facturas. Subís una foto (o usás la cámara), la IA extrae proveedor, RUC, items, IVA y totales, detecta duplicados y envía todo a tu Google Sheet o CSV en segundos. Incluye organización por rubros, historial de escaneos, estadísticas de uso, configuración de planilla de destino y un plan freemium con 5 escaneos gratis. Soporte para dark mode y sin instalación: 100% web.",
    features: [
      {
        title: "Extracción con IA",
        description:
          "Lee proveedor, RUC, items, IVA y totales automáticamente desde una foto del comprobante.",
      },
      {
        title: "Detección de duplicados",
        description:
          "Avisa si ya cargaste esa factura antes, evitando doble imputación contable.",
      },
      {
        title: "Export a Google Sheets",
        description:
          "Conectá tu planilla de destino o descargá CSV, sin configuración compleja.",
      },
      {
        title: "Organización por rubros",
        description:
          "Clasificá comprobantes por rubro (contador, abogado, administrador, freelancer, PyME) para reporting.",
      },
      {
        title: "Historial y estadísticas",
        description:
          "Revisá escaneos previos y métricas de uso para controlar el consumo del plan.",
      },
      {
        title: "Freemium sin instalación",
        description:
          "5 escaneos gratis para empezar, 100% web, dark mode nativo y cámara integrada.",
      },
    ],
    metrics: [
      { label: "Tiempo por factura", value: "10s" },
      { label: "Campos extraídos", value: "5+" },
      { label: "Escaneos gratis", value: "5" },
      { label: "Beta rating", value: "4.9" },
    ],
    techStack: [
      { name: "Next.js", category: "frontend" },
      { name: "React", category: "frontend" },
      { name: "TypeScript", category: "frontend" },
      { name: "Python", category: "backend" },
      { name: "Tailwind CSS", category: "frontend" },
      { name: "PostgreSQL", category: "database" },
      { name: "Supabase", category: "backend" },
      { name: "Docker", category: "infra" },
      { name: "OCR", category: "ai" },
      { name: "Claude", category: "ai" },
      { name: "MCP", category: "tooling" },
      { name: "Google Sheets API", category: "backend" },
    ],
    highlights: [
      "OCR + IA para facturas",
      "Export directo a Google Sheets",
      "Detección de duplicados",
      "Freemium 5 escaneos gratis",
    ],
    audience:
      "Contadores, estudios contables, abogados, administradores y PyMEs que procesan volumen de facturas y necesitan automatizar la carga manual.",
  },
  {
    slug: "notesapp-uchiha",
    name: "NotesApp Uchiha",
    tagline: "Tablero de tareas con estilo doodle, notas adhesivas y logros inspirados en Bleach",
    category: "Productividad IA",
    status: "live",
    year: "2026",
    url: "https://notesapp.deividtech.cloud/",
    accent: "from-zinc-800 via-zinc-900 to-black",
    icon: "Sticker",
    screenshot: "/screenshots/despega-peelme.png",
    summary:
      "Tablero de tareas gamificado con estilo doodle, notas adhesivas arrastrables y sistema de logros inspirado en el anime Bleach. Nació de un post random en X.",
    description:
      "Productividad con personalidad. Notas adhesivas que se arrastran, tareas con prioridad visual y logros desbloqueables estilo anime. Dark y light mode nativo.",
    longDescription:
      "NotesApp Uchiha nació de un post random en X. Vi una idea de tablero de tareas con notas adhesivas estilo doodle y dije: tengo que hacer esto. La verdad fue una idea loca que se materialó en una semana. Es un tablero de tareas gamificado: las tareas son notas adhesivas que se arrastran, tienen prioridad visual con colores y animaciones, y hay un sistema de logros inspirado en el anime Bleach con sellos animados. Dark y light mode nativo con paleta creme en light y negro puro en dark. Sin cuentas, sin login, todo se guarda en el navegador. Es productividad que no aburre.",
    features: [
      {
        title: "Notas adhesivas arrastrables",
        description:
          "Las tareas son notas que se mueven entre columnas con animación de caída y efecto paper.",
      },
      {
        title: "Sistema de logros Bleach",
        description:
          "Sellos animados estilo anime que se desbloquean al completar tareas y mantener rachas.",
      },
      {
        title: "Prioridad visual con glow",
        description:
          "La tarea más urgente brilla con animación pulsante para que no se te pase.",
      },
      {
        title: "Dark y Light mode nativo",
        description:
          "Negro puro en dark, creme paper en light. Detección automática del sistema.",
      },
      {
        title: "Sin cuentas ni login",
        description:
          "Todo se guarda en el navegador. Privacidad total, cero fricción.",
      },
      {
        title: "Modo doodle",
        description:
          "Estilo visual hand-drawn con textura de papel arrugado y tipografía casual.",
      },
    ],
    metrics: [
      { label: "Modos", value: "2" },
      { label: "Logros", value: "6+" },
      { label: "Animaciones", value: "15+" },
      { label: "Cuentas", value: "0" },
    ],
    techStack: [
      { name: "Next.js", category: "frontend" },
      { name: "React", category: "frontend" },
      { name: "TypeScript", category: "frontend" },
      { name: "Tailwind CSS", category: "frontend" },
      { name: "Framer Motion", category: "frontend" },
      { name: "Local Storage", category: "tooling" },
    ],
    highlights: [
      "Nació de un post en X",
      "Notas adhesivas arrastrables",
      "Logros inspirados en Bleach",
      "Dark y Light mode nativo",
    ],
    audience:
      "Cualquiera que quiera productividad que no aburre. Para los que odian Trello pero aman los animes.",
  },
];

export const profile = {
  name: "David Garay",
  brand: "Deivid Tech",
  role: "Full-Stack Developer · Ciberseguridad · IA",
  domain: "deividtech.cloud",
  email: "davidgaray849@gmail.com",
  github: "https://github.com/deividtech",
  githubUser: "deividtech",
  avatar: "/profile-photo.png",
  location: "Paraguay · Remoto",
  available: true,
  bio: "Desde Paraguay desarrollo productos web y me meto en ciberseguridad. Kali Linux es lo mío. Empecé con Python y no paré. Me hice amigos en varios países gracias al código, tengo un compa en España con el que charlamos hace años. Me gusta compartir lo que aprendo y estoy abierto a nuevas oportunidades. Si tenés una idea o un problema, escribí y lo resolvemos.",
  longBio:
    "Estudié programación con Python y de ahí salté al ecosistema web. Hoy trabajo con React, Next.js, TypeScript, Docker, PostgreSQL y Supabase. Pero no solo programo. También me dedico a la ciberseguridad y el hacking ético. Hice cursos de Kali Linux a nivel intermedio avanzado, hacking ético ofensivo en Red Team, configuración de firewalls y pentesting. Combino el desarrollo con la seguridad para que mis productos no solo funcionen sino que estén protegidos. Uso IA todos los días. ChatGPT, Claude, Cursor y Codex son parte de cómo trabajo. Soy una persona amigable y gracias a la programación conocí gente en varios países. Tengo un gran amigo en España con el que ya van muchos años de charlas y proyectos. Me encanta compartir lo que aprendo y siempre estoy dispuesto a charlar sobre ideas nuevas y oportunidades.",
  stats: [
    { label: "Sistemas en producción", value: "4" },
    { label: "Líneas de código", value: "50k+" },
    { label: "Tecnologías dominadas", value: "15+" },
    { label: "Años desarrollando", value: "5+" },
  ],
  services: [
    {
      icon: "Rocket",
      title: "Desarrollo full-stack",
      description:
        "Diseño, frontend, backend, base de datos y deploy. Todo en uno, sin intermediarios.",
    },
    {
      icon: "BrainCircuit",
      title: "IA en el día a día",
      description:
        "Cursor, Claude y Codex como mis pares de programación. Entrego más rápido y mejor.",
    },
    {
      icon: "ShieldCheck",
      title: "Ciberseguridad",
      description:
        "Pentesting, hardening y auditorías. Tus apps no solo funcionan, están protegidas.",
    },
    {
      icon: "Zap",
      title: "Deploy y operación",
      description:
        "Docker, Vercel y monitoreo. Lo pongo en producción y lo mantengo andando.",
    },
  ],
  socials: [
    { label: "GitHub", url: "https://github.com/davidgaray849", icon: "Github" },
    { label: "Portfolio", url: "https://deividtech.cloud", icon: "Globe" },
    { label: "PeelMe", url: "https://peelme.deividtech.cloud/", icon: "Sticker" },
    { label: "Redline", url: "https://redline.deividtech.cloud/auth", icon: "Truck" },
    {
      label: "FactuSheet",
      url: "https://oboroscan-app.deividtech.cloud/",
      icon: "FileScan",
    },
    {
      label: "NotesApp",
      url: "https://notesapp.deividtech.cloud/",
      icon: "Sticker",
    },
  ],
};

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
