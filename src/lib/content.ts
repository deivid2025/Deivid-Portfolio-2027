// Editorial content for the portfolio: testimonials, devlog/updates,
// working process and FAQ. Kept as typed in-memory data so it stays fast
// and dependency-free until we decide to move it to Prisma.

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number; // 1..5
  avatarInitials: string;
  accent: string; // tailwind gradient classes
  project?: string;
}

export const testimonials: Testimonial[] = [
  {
    name: "Carolina Méndez",
    role: "Contadora · Estudio CM Contables",
    company: "Estudio CM",
    quote:
      "FactuSheet nos ahorró un mínimo de 6 horas por semana de carga manual. La detección de duplicados ya nos evitó doble imputación dos veces. David entendió el flujo contable real, no solo el técnico.",
    rating: 5,
    avatarInitials: "CM",
    accent: "from-emerald-500 to-teal-600",
    project: "FactuSheet",
  },
  {
    name: "Federico Aguilar",
    role: "Dueño de flota · 4 volcadores",
    company: "Aguilar Volcadores",
    quote:
      "Antes llevaba los viajes en una libreta y los ingresos en un Excel suelto. Con Redline veo en tiempo real qué chofer rinde, qué viaje deja y qué unidad está parada. Es otra empresa.",
    rating: 5,
    avatarInitials: "FA",
    accent: "from-rose-500 to-red-600",
    project: "Redline",
  },
  {
    name: "Valentina Ríos",
    role: "TikTok creator · 180k seguidores",
    company: "@valerios",
    quote:
      "Comenté STICKER en un video y a las 3 horas ya tenía el ZIP con mis 10 stickers en WhatsApp. El efecto peel es adictivo, mis seguidores los usan en sus historias. Cero fricción, cero espera.",
    rating: 5,
    avatarInitials: "VR",
    accent: "from-amber-500 to-orange-600",
    project: "DESPEGA!",
  },
  {
    name: "Martín Salazar",
    role: "CTO · Agencia de producto",
    company: "Salazar Studio",
    quote:
      "Trabajé con David en un MVP en 3 semanas. Pasa de diseño a producción sin perder calidad. El código es limpio, tipado y mantenible. Raro encontrar un full-stack que domine producto y detalle.",
    rating: 5,
    avatarInitials: "MS",
    accent: "from-violet-500 to-purple-600",
  },
  {
    name: "Lucía Fernández",
    role: "Diseñadora freelance",
    company: "Lucía Studio",
    quote:
      "Tres clientes me pidieron stickers con su marca. Mandé la idea por DM y al otro día tenía el pack. El laboratorio interactivo es una joya: el cliente ve el sticker antes de pagar.",
    rating: 5,
    avatarInitials: "LF",
    accent: "from-cyan-500 to-blue-500",
    project: "DESPEGA!",
  },
];

export interface UpdatePost {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  date: string; // ISO
  category: "release" | "devlog" | "case-study" | "announcement";
  tags: string[];
  project?: string;
  readTime: number; // minutes
}

export const updates: UpdatePost[] = [
  {
    slug: "notesapp-idea-loca-nacio-en-x",
    title: "NotesApp Uchiha: la idea loca que nació de un post en X",
    excerpt:
      "Vi un post en X sobre un tablero de tareas con notas adhesivas estilo doodle y dije: tengo que hacer esto. Una semana después estaba en producción.",
    body: [
      "La verdad, NotesApp Uchiha nació por accidente. Estaba scrolleando X (como siempre) y vi un post sobre un tablero de tareas con notas adhesivas. No era nada del otro mundo, pero algo hizo click. Me dije: tengo que hacer esto, pero con mi toque.",
      "El toque fue meterle el anime Bleach por arriba. Sistema de logros con sellos animados, prioridad visual con glow pulsante, estilo doodle con textura de papel arrugado. Productividad que no aburre, básicamente.",
      "Lo armé en una semana. Next.js, React, TypeScript, Tailwind y Framer Motion para las animaciones. Sin cuentas, sin login, todo en el navegador. Dark mode negro puro y light mode creme paper. Lo deployé en notesapp.deividtech.cloud y listo.",
      "La moraleja: a veces las mejores ideas no vienen de un brainstorming ni de un análisis de mercado. Vienen de un post random en X a las 2 de la mañana. Si te copa una idea, hacela. No lo pienses dos veces.",
    ],
    date: "2026-10-12",
    category: "devlog",
    tags: ["NotesApp", "Bleach", "X", "idea loca", "productividad", "anime"],
    project: "NotesApp Uchiha",
    readTime: 3,
  },
  {
    slug: "factusheet-beta-publica",
    title: "FactuSheet abre beta pública con 5 escaneos gratis",
    excerpt:
      "Lanzamos la beta abierta de FactuSheet: escaneo con IA, detección de duplicados y export directo a Google Sheets. 5 escaneos sin costo para empezar.",
    body: [
      "Después de 4 semanas de beta privada con 3 estudios contables, hoy abrimos FactuSheet a todo el mundo. La idea es simple: subir una foto de factura y que los datos caigan solos en tu planilla.",
      "El motor de extracción ahora lee proveedor, RUC, items, IVA y totales con un error promedio menor al 4% en beta privada (4.9/5 de rating). Sumamos detección de duplicados para evitar la doble imputación, que es el dolor real de los contadores.",
      "El plan freemium arranca con 5 escaneos gratis, sin tarjeta, sin instalación: 100% web, con dark mode nativo y cámara integrada para escanear desde el celular.",
    ],
    date: "2026-01-15",
    category: "release",
    tags: ["FactuSheet", "IA", "beta", "OCR", "Google Sheets"],
    project: "FactuSheet",
    readTime: 3,
  },
  {
    slug: "redline-dashboard-financiero",
    title: "Redline: nuevo dashboard financiero por unidad y chofer",
    excerpt:
      "Sumamos la vista de rentabilidad por unidad y por chofer, con indicadores de productividad en tiempo real para flotas de volcadores.",
    body: [
      "El dashboard financiero de Redline ahora desglosa ingresos, costos y rentabilidad por unidad y por chofer. El administrador ve de un vistazo qué unidad deja y cuál no, sin armar planillas.",
      "Los indicadores de productividad se calculan en tiempo real a partir de los viajes cargados, así que no hay que esperar al cierre del día para detectar un problema.",
      "Próximo hito: alertas de inactividad y reporte mensual exportable a PDF.",
    ],
    date: "2026-01-08",
    category: "release",
    tags: ["Redline", "logística", "dashboard", "finanzas"],
    project: "Redline",
    readTime: 2,
  },
  {
    slug: "despega-laboratorio-materiales",
    title: "DESPEGA! amplía el laboratorio con 4 materiales y sonido de despegue",
    excerpt:
      "El laboratorio interactivo de stickers ahora soporta 4 materiales (original, láser/holográfico, resplandecer y película reflectante) y efecto de sonido al despegar.",
    body: [
      "El motor del laboratorio de DESPEGA! ahora renderiza 4 materiales con su peel real: original, láser/holográfico, resplandecer y película reflectante. El cliente ve el sticker final antes de pedir.",
      "Sumamos el sonido de despegue y la descarga de video peel listo para compartir en historias, con la marca DESPEGA! incluida.",
      "El ZIP final ahora incluye PNG troquelado + video peel + guía de uso e impresión, todo entregado por DM en menos de 24 horas.",
    ],
    date: "2025-12-20",
    category: "release",
    tags: ["DESPEGA!", "stickers", "peel", "laboratorio"],
    project: "DESPEGA!",
    readTime: 2,
  },
  {
    slug: "stack-nextjs-16-tailwind-4",
    title: "Migración a Next.js 16 + Tailwind 4: qué cambió y por qué",
    excerpt:
      "Cómo migré el portfolio a Next.js 16 con App Router y Tailwind 4, qué ganamos en performance y DX, y los detalles que más dolieron.",
    body: [
      "Next.js 16 trae mejoras concretas: compilación más rápida, mejor tree-shaking en el App Router y metadata API más limpia. La DX mejora sobre todo en el modo dev.",
      "Tailwind 4 con el engine nuevo (PostCSS based) reduce el CSS final y permite usar @theme inline para mapear variables CSS a utilidades sin config JS. El resultado: paleta más consistente.",
      "El detalle que más dolieron: la transición de plugin JS a @custom-variant para dark mode, y ajustar el soporte de oklch en Safari más antiguo con fallback.",
    ],
    date: "2025-12-10",
    category: "devlog",
    tags: ["Next.js", "Tailwind", "stack", "DX"],
    readTime: 4,
  },
  {
    slug: "caso-estudio-factusheet-estudios",
    title: "Caso de estudio: cómo FactuSheet ahorra 6h semanales en un estudio contable",
    excerpt:
      "El proceso real antes/después de FactuSheet en un estudio que procesa 80 facturas por semana, con números de tiempo ahorrado y errores evitados.",
    body: [
      "El estudio CM procesa unas 80 facturas por semana entre tres contadores. Antes, la carga manual era el cuello de botella: 8 a 10 horas semanales por persona.",
      "Con FactuSheet, el flujo es: subir foto → revisar campos extraídos → confirmar → caen en la planilla. El tiempo de carga bajó a 2-3 horas semanales por persona, y los errores de tipeo desaparecieron.",
      "La detección de duplicados ya evitó dos doble-imputaciones en el primer mes, que es el error más caro de corregir en cierre de mes.",
    ],
    date: "2025-11-28",
    category: "case-study",
    tags: ["FactuSheet", "caso de estudio", "productividad"],
    project: "FactuSheet",
    readTime: 5,
  },
];

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
}

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Descubrimiento",
    description:
      "Llamada de 30 min para entender el problema, el usuario y el resultado esperado. Sin compromiso, sin buzzwords.",
    icon: "Search",
    duration: "30 min",
  },
  {
    number: "02",
    title: "Propuesta y alcance",
    description:
      "Documento con alcance, stack, milestones, presupuesto orientativo y entregables. Aprobás o ajustamos antes de arrancar.",
    icon: "FileText",
    duration: "1-2 días",
  },
  {
    number: "03",
    title: "Build iterativo",
    description:
      "Desarrollo por sprints con demos cada semana. Vas viendo el producto crecer en un ambiente staging desde el día 3.",
    icon: "Code2",
    duration: "2-6 semanas",
  },
  {
    number: "04",
    title: "Deploy y operación",
    description:
      "Pongo en producción, configuro dominio, métricas y monitoreo. Quedo como soporte nivel 1 durante el primer mes.",
    icon: "Rocket",
    duration: "1 día + soporte",
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const faqs: FaqItem[] = [
  {
    question: "¿Trabajás solo o tenés equipo?",
    answer:
      "Trabajo solo en la mayoría de los proyectos, pero tengo un circuito de diseñadores y devs de confianza para escalar cuando hace falta. La ventaja de trabajar solo: una sola persona entiende el producto de punta a punta.",
  },
  {
    question: "¿Cuánto tarda un proyecto promedio?",
    answer:
      "Un MVP funcional arranca en 2-3 semanas. Sistemas más completos como Redline o FactuSheet toman de 6 a 10 semanas. La diferencia principal la hace qué tan claro está el alcance antes de empezar.",
  },
  {
    question: "¿Cómo es la forma de pago?",
    answer:
      "Trabajo con un 50% al arranque y 50% al deploy, más hitos intermedios en proyectos largos. Acepto transferencia, MercadoPago y USD vía link de pago. Para clientes externos también cripto.",
  },
  {
    question: "¿Quién es el dueño del código?",
    answer:
      "Vos. Entrego el repositorio completo con acceso y documentación. Sin lock-in, sin dependencia del proveedor. Si querés que otro dev tome el relevo, puede.",
  },
  {
    question: "¿Dás soporte post-deploy?",
    answer:
      "Sí. El primer mes de soporte nivel 1 está incluido. Después podés contratar un plan de mantenimiento mensual por hora o por incidente.",
  },
  {
    question: "¿Hacés NDA / confidencialidad?",
    answer:
      "Sí, firmo NDA sin problema. Si tu proyecto es sensible, arreglamos el alcance de la confidencialidad antes de la propuesta.",
  },
];
