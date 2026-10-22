// Lightweight i18n layer for the portfolio (ES / PT).
// Uses React Context instead of next-intl's plugin so the App Router config
// stays untouched and the dev server keeps hot-reloading cleanly.

export type Locale = "es" | "pt";

export interface Dict {
  nav: {
    projects: string;
    process: string;
    testimonials: string;
    blog: string;
    stack: string;
    faq: string;
    contact: string;
    available: string;
    openMenu: string;
    workTogether: string;
    languageLabel: string;
    home: string;
  };
  hero: {
    badge: string;
    greeting: (name: string) => string;
    typingWords: string[];
    bio: string;
    ctaProjects: string;
    ctaContact: string;
    stats: { systems: string; lines: string; techs: string; years: string };
  };
  marquee: string[];
  projects: {
    badge: string;
    title: string;
    subtitle: string;
    filters: { all: string; saas: string; ecommerce: string; logistics: string; ai: string };
    viewDetail: string;
    visit: string;
    views: string;
    empty: string;
    error: string;
    retry: string;
  };
  project: {
    status: { live: string; beta: string; maintenance: string };
    description: string;
    features: string;
    metrics: string;
    stack: string;
    audience: string;
    open: string;
    close: string;
    year: string;
    category: string;
    state: string;
    related: string;
    share: string;
    copied: string;
    copySuccess: string;
    copyError: string;
  };
  about: {
    badge: string;
    title: string;
    bio: string;
    location: string;
    available: string;
    activity: string;
    commits: string;
    activeDays: string;
    less: string;
    more: string;
  };
  services: {
    badge: string;
    title: string;
    subtitle: string;
    items: { title: string; description: string }[];
  };
  process: {
    badge: string;
    title: string;
    subtitle: string;
    steps: { title: string; description: string; duration: string }[];
  };
  testimonials: {
    badge: string;
    title: string;
    subtitle: string;
    cta: string;
    next: string;
    prev: string;
  };
  updates: {
    badge: string;
    title: string;
    subtitle: string;
    readTime: (n: number) => string;
    read: string;
    categories: { release: string; devlog: string; "case-study": string; announcement: string };
    about: string;
    close: string;
    loading: string;
  };
  stack: {
    badge: string;
    title: string;
    subtitle: string;
    categories: { frontend: string; backend: string; database: string; infra: string; ai: string; tooling: string };
  };
  faq: {
    badge: string;
    title: string;
    subtitle: string;
    ctaTitle: string;
    ctaBody: string;
    ctaButton: string;
  };
  contact: {
    badge: string;
    title: string;
    subtitle: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    send: string;
    sending: string;
    sent: string;
    sendAnother: string;
    responseTime: string;
    errors: { name: string; email: string; message: string };
    success: string;
    error: string;
  };
  footer: {
    tagline: string;
    nav: string;
    systems: string;
    contact: string;
    response: string;
    available: string;
    madeWith: string;
    rights: string;
  };
  search: {
    placeholder: string;
    open: string;
    empty: string;
    short: string;
    groups: { nav: string; projects: string; blog: string };
  };
  backToTop: string;
}

const es: Dict = {
  nav: {
    projects: "Proyectos",
    process: "Proceso",
    testimonials: "Testimonios",
    blog: "Blog",
    stack: "Stack",
    faq: "FAQ",
    contact: "Contacto",
    available: "Disponible",
    openMenu: "Abrir menú",
    workTogether: "Trabajemos juntos",
    languageLabel: "Idioma",
    home: "Inicio",
  },
  hero: {
    badge: "Portfolio · 5 sistemas en producción",
    greeting: (name) => `Hola, soy ${name}.`,
    typingWords: [
      "full-stack developer",
      "product builder",
      "IA aplicada",
      "e-commerce conversacional",
    ],
    bio: "Diseño y construyo productos web de principio a fin: desde la idea y el diseño hasta el despliegue y la operación. Me especializo en experiencias conversacionales, IA aplicada y herramientas que ahorran horas de trabajo manual.",
    ctaProjects: "Ver proyectos",
    ctaContact: "Trabajemos juntos",
    stats: {
      systems: "Sistemas en producción",
      lines: "Líneas de código",
      techs: "Tecnologías dominadas",
      years: "Años desarrollando",
    },
  },
  marquee: [
    "Next.js 16",
    "TypeScript",
    "React 19",
    "Tailwind CSS 4",
    "shadcn/ui",
    "Docker",
    "IA · LLM",
    "OCR",
    "MCP",
    "Google Sheets API",
    "Framer Motion",
    "Zustand",
    "TanStack Query",
    "Dark mode",
  ],
  projects: {
    badge: "Sistemas en producción",
    title: "Proyectos seleccionados",
    subtitle:
      "Cada proyecto de acá está vivo en producción. Hacé clic en una tarjeta para ver el stack, las funcionalidades y la descripción profesional completa.",
    filters: {
      all: "Todos",
      saas: "Producto SaaS",
      ecommerce: "E-commerce",
      logistics: "Logística",
      ai: "Productividad IA",
    },
    viewDetail: "Ver detalle",
    visit: "Visitar",
    views: "vistas",
    empty: "No hay proyectos en esta categoría todavía.",
    error: "No pude cargar los proyectos desde la API.",
    retry: "Reintentar",
  },
  project: {
    status: { live: "En vivo", beta: "Beta", maintenance: "Mantenimiento" },
    description: "Descripción profesional",
    features: "Funcionalidades clave",
    metrics: "Métricas",
    stack: "Stack tecnológico",
    audience: "Para quién es",
    open: "Abrir proyecto",
    close: "Cerrar",
    year: "Año",
    category: "Categoría",
    state: "Estado",
    related: "Ver también",
    share: "Compartir",
    copied: "Copiado",
    copySuccess: "Link copiado al portapapeles",
    copyError: "No pude copiar el link",
  },
  about: {
    badge: "Sobre mí",
    title: "Construyo productos de principio a fin",
    bio: "Soy desarrollador full-stack enfocado en producto. Construyo SaaS, e-commerce y herramientas de productividad con IA, priorizando velocidad de entrega y experiencia de usuario real. Cada proyecto que pubblico en este portfolio es un sistema en producción, no un demo.",
    location: "Paraguay · Remoto",
    available: "Disponible para nuevos proyectos",
    activity: "Actividad reciente",
    commits: "commits",
    activeDays: "días activos",
    less: "Menos",
    more: "Más",
  },
  services: {
    badge: "Servicios",
    title: "Cómo puedo ayudarte",
    subtitle:
      "Desde la idea hasta el deploy. Si tu negocio necesita una herramienta a medida, un SaaS o integrar IA, lo resolvemos.",
    items: [
      {
        title: "Producto de principio a fin",
        description:
          "De la idea al deploy: diseño, frontend, backend, base de datos y operación.",
      },
      {
        title: "IA aplicada",
        description:
          "OCR, LLM, MCP y automatizaciones que eliminan trabajo repetitivo.",
      },
      {
        title: "Entrega rápida",
        description:
          "MVPs y sistemas en producción con workflows conversacionales y sin fricción.",
      },
      {
        title: "Deploy y operación",
        description: "Docker, Vercel y monitoreo. Lo pongo en producción y lo mantengo andando.",
      },
    ],
  },
  process: {
    badge: "Proceso",
    title: "Cómo trabajo, paso a paso",
    subtitle:
      "Sin sorpresas. Cada fase tiene un entregable claro y un tiempo acotado, así sabés en qué punto estás del proyecto en cualquier momento.",
    steps: [
      {
        title: "Descubrimiento",
        description:
          "Llamada de 30 min para entender el problema, el usuario y el resultado esperado. Sin compromiso, sin buzzwords.",
        duration: "30 min",
      },
      {
        title: "Propuesta y alcance",
        description:
          "Documento con alcance, stack, milestones, presupuesto orientativo y entregables. Aprobás o ajustamos antes de arrancar.",
        duration: "1-2 días",
      },
      {
        title: "Build iterativo",
        description:
          "Desarrollo por sprints con demos cada semana. Vas viendo el producto crecer en un ambiente staging desde el día 3.",
        duration: "2-6 semanas",
      },
      {
        title: "Deploy y operación",
        description:
          "Pongo en producción, configuro dominio, métricas y monitoreo. Quedo como soporte nivel 1 durante el primer mes.",
        duration: "1 día + soporte",
      },
    ],
  },
  testimonials: {
    badge: "Testimonios",
    title: "Lo que dicen mis clientes",
    subtitle:
      "Reviews reales de los cinco sistemas en producción y de proyectos a medida.",
    cta: "¿Querés ser el próximo caso de éxito? Hablemos.",
    next: "Testimonio siguiente",
    prev: "Testimonio anterior",
  },
  updates: {
    badge: "Devlog & Novedades",
    title: "Últimas actualizaciones",
    subtitle:
      "Releases, devlogs y casos de estudio de los proyectos en producción. Acá documento lo que voy construyendo.",
    readTime: (n) => `${n} min de lectura`,
    read: "Leer",
    categories: {
      release: "Release",
      devlog: "Devlog",
      "case-study": "Caso de estudio",
      announcement: "Anuncio",
    },
    about: "Devlog de Deivid Tech",
    close: "Cerrar",
    loading: "Cargando…",
  },
  stack: {
    badge: "Stack",
    title: "Tecnologías que uso en producción",
    subtitle:
      "Cada tecnología de esta lista está corriendo en uno o más de los sistemas que ves arriba. No es teoría, es stack real.",
    categories: {
      frontend: "Frontend",
      backend: "Backend",
      database: "Base de datos",
      infra: "Infra",
      ai: "IA",
      tooling: "Tooling",
    },
  },
  faq: {
    badge: "Preguntas frecuentes",
    title: "Lo que más me preguntan",
    subtitle: "Si tu duda no está acá, escribime y la respondo en menos de 24h.",
    ctaTitle: "¿Tu pregunta no está acá?",
    ctaBody: "Respondo en menos de 24h hábiles.",
    ctaButton: "Hablamos",
  },
  contact: {
    badge: "Disponible para nuevos proyectos",
    title: "Trabajemos juntos",
    subtitle:
      "Contame tu idea, tu problema o tu MVP. Te respondo en menos de 24h con un plan concreto y un primer presupuesto orientativo.",
    name: "Nombre",
    namePlaceholder: "¿Cómo te llamás?",
    email: "Email",
    emailPlaceholder: "tu@email.com",
    message: "Contame sobre tu proyecto",
    messagePlaceholder: "Qué querés construir, qué problema resuelve, timelines...",
    send: "Enviar mensaje",
    sending: "Enviando…",
    sent: "Enviado",
    sendAnother: "Enviar otro mensaje",
    responseTime: "Respuesta en menos de 24h hábiles",
    errors: {
      name: "Decime tu nombre (mínimo 2 caracteres).",
      email: "Necesito un email válido para responderte.",
      message: "Contame un poco más sobre tu proyecto (mínimo 10 caracteres).",
    },
    success: "¡Mensaje enviado! Te respondo en menos de 24h.",
    error: "Algo salió mal. Probá de nuevo.",
  },
  footer: {
    tagline:
      "Portfolio de David, full-stack developer & product builder. Sistemas en producción, no demos.",
    nav: "Navegación",
    systems: "Sistemas",
    contact: "Contacto",
    response: "Respuesta en 24h hábiles",
    available: "Disponible",
    madeWith: "Hecho con",
    rights: "Todos los derechos reservados.",
  },
  search: {
    placeholder: "Buscar proyectos, posts o secciones…",
    open: "Abrir búsqueda (⌘K)",
    empty: "Sin resultados.",
    short: "Buscar…",
    groups: { nav: "Navegación", projects: "Proyectos", blog: "Blog & Novedades" },
  },
  backToTop: "Volver arriba",
};

const pt: Dict = {
  nav: {
    projects: "Projetos",
    process: "Processo",
    testimonials: "Depoimentos",
    blog: "Blog",
    stack: "Stack",
    faq: "FAQ",
    contact: "Contato",
    available: "Disponível",
    openMenu: "Abrir menu",
    workTogether: "Vamos trabalhar",
    languageLabel: "Idioma",
    home: "Início",
  },
  hero: {
    badge: "Portfólio · 5 sistemas em produção",
    greeting: (name) => `Olá, sou ${name}.`,
    typingWords: [
      "full-stack developer",
      "product builder",
      "IA aplicada",
      "e-commerce conversacional",
    ],
    bio: "Projeto e construo produtos web de ponta a ponta: da ideia e do design ao deploy e à operação. Eu me especializo em experiências conversacionais, IA aplicada e ferramentas que economizam horas de trabalho manual.",
    ctaProjects: "Ver projetos",
    ctaContact: "Vamos trabalhar juntos",
    stats: {
      systems: "Sistemas em produção",
      lines: "Linhas de código",
      techs: "Tecnologias dominadas",
      years: "Anos desenvolvendo",
    },
  },
  marquee: [
    "Next.js 16",
    "TypeScript",
    "React 19",
    "Tailwind CSS 4",
    "shadcn/ui",
    "Docker",
    "IA · LLM",
    "OCR",
    "MCP",
    "Google Sheets API",
    "Framer Motion",
    "Zustand",
    "TanStack Query",
    "Dark mode",
  ],
  projects: {
    badge: "Sistemas em produção",
    title: "Projetos selecionados",
    subtitle:
      "Cada projeto daqui está vivo em produção. Clique num card para ver o stack, as funcionalidades e a descrição profissional completa.",
    filters: {
      all: "Todos",
      saas: "Produto SaaS",
      ecommerce: "E-commerce",
      logistics: "Logística",
      ai: "Produtividade IA",
    },
    viewDetail: "Ver detalhes",
    visit: "Visitar",
    views: "visualizações",
    empty: "Não há projetos nesta categoria ainda.",
    error: "Não consegui carregar os projetos da API.",
    retry: "Tentar novamente",
  },
  project: {
    status: { live: "Ao vivo", beta: "Beta", maintenance: "Manutenção" },
    description: "Descrição profissional",
    features: "Funcionalidades principais",
    metrics: "Métricas",
    stack: "Stack tecnológico",
    audience: "Para quem é",
    open: "Abrir projeto",
    close: "Fechar",
    year: "Ano",
    category: "Categoria",
    state: "Estado",
    related: "Ver também",
    share: "Compartilhar",
    copied: "Copiado",
    copySuccess: "Link copiado para a área de transferência",
    copyError: "Não consegui copiar o link",
  },
  about: {
    badge: "Sobre mim",
    title: "Construo produtos de ponta a ponta",
    bio: "Sou desenvolvedor full-stack focado em produto. Construo SaaS, e-commerce e ferramentas de produtividade com IA, priorizando velocidade de entrega e experiência de usuário real. Cada projeto que publico neste portfólio é um sistema em produção, não uma demo.",
    location: "Paraguay · Remoto",
    available: "Disponível para novos projetos",
    activity: "Atividade recente",
    commits: "commits",
    activeDays: "dias ativos",
    less: "Menos",
    more: "Mais",
  },
  services: {
    badge: "Serviços",
    title: "Como posso ajudar",
    subtitle:
      "Da ideia ao deploy. Se seu negócio precisa de uma ferramenta sob medida, um SaaS ou integrar IA, resolvemos.",
    items: [
      {
        title: "Produto de ponta a ponta",
        description:
          "Da ideia ao deploy: design, frontend, backend, banco de dados e operação.",
      },
      {
        title: "IA aplicada",
        description:
          "OCR, LLM, MCP e automações que eliminam trabalho repetitivo.",
      },
      {
        title: "Entrega rápida",
        description:
          "MVPs e sistemas em produção com workflows conversacionais e sem atrito.",
      },
      {
        title: "Deploy e operação",
        description: "Docker, Vercel e monitoramento. Coloco em produção e mantenho funcionando.",
      },
    ],
  },
  process: {
    badge: "Processo",
    title: "Como trabalho, passo a passo",
    subtitle:
      "Sem surpresas. Cada fase tem um entregável claro e um tempo definido, assim você sabe em que ponto está do projeto a qualquer momento.",
    steps: [
      {
        title: "Descoberta",
        description:
          "Chamada de 30 min para entender o problema, o usuário e o resultado esperado. Sem compromisso, sem buzzwords.",
        duration: "30 min",
      },
      {
        title: "Proposta e escopo",
        description:
          "Documento com escopo, stack, milestones, orçamento orientativo e entregáveis. Você aprova ou ajustamos antes de começar.",
        duration: "1-2 dias",
      },
      {
        title: "Build iterativo",
        description:
          "Desenvolvimento por sprints com demos toda semana. Você vê o produto crescer num ambiente de staging desde o dia 3.",
        duration: "2-6 semanas",
      },
      {
        title: "Deploy e operação",
        description:
          "Coloco em produção, configuro domínio, métricas e monitoramento. Fico como suporte nível 1 durante o primeiro mês.",
        duration: "1 dia + suporte",
      },
    ],
  },
  testimonials: {
    badge: "Depoimentos",
    title: "O que meus clientes dizem",
    subtitle:
      "Reviews reais dos cinco sistemas em produção e de projetos sob medida.",
    cta: "Quer ser o próximo caso de sucesso? Vamos conversar.",
    next: "Depoimento seguinte",
    prev: "Depoimento anterior",
  },
  updates: {
    badge: "Devlog & Novidades",
    title: "Últimas atualizações",
    subtitle:
      "Releases, devlogs e casos de estudo dos projetos em produção. Aqui documento o que venho construindo.",
    readTime: (n) => `${n} min de leitura`,
    read: "Ler",
    categories: {
      release: "Release",
      devlog: "Devlog",
      "case-study": "Caso de estudo",
      announcement: "Anúncio",
    },
    about: "Devlog de Deivid Tech",
    close: "Fechar",
    loading: "Carregando…",
  },
  stack: {
    badge: "Stack",
    title: "Tecnologias que uso em produção",
    subtitle:
      "Cada tecnologia desta lista está rodando em um ou mais dos sistemas que você vê acima. Não é teoria, é stack real.",
    categories: {
      frontend: "Frontend",
      backend: "Backend",
      database: "Banco de dados",
      infra: "Infra",
      ai: "IA",
      tooling: "Tooling",
    },
  },
  faq: {
    badge: "Perguntas frequentes",
    title: "O que mais me perguntam",
    subtitle: "Se sua dúvida não está aqui, escreva que respondo em menos de 24h.",
    ctaTitle: "Sua pergunta não está aqui?",
    ctaBody: "Respondo em menos de 24h úteis.",
    ctaButton: "Vamos conversar",
  },
  contact: {
    badge: "Disponível para novos projetos",
    title: "Vamos trabalhar juntos",
    subtitle:
      "Conte sua ideia, seu problema ou seu MVP. Respondo em menos de 24h com um plano concreto e um primeiro orçamento orientativo.",
    name: "Nome",
    namePlaceholder: "Como você se chama?",
    email: "Email",
    emailPlaceholder: "seu@email.com",
    message: "Conte sobre seu projeto",
    messagePlaceholder: "O que quer construir, que problema resolve, prazos...",
    send: "Enviar mensagem",
    sending: "Enviando…",
    sent: "Enviado",
    sendAnother: "Enviar outra mensagem",
    responseTime: "Resposta em menos de 24h úteis",
    errors: {
      name: "Diga seu nome (mínimo 2 caracteres).",
      email: "Preciso de um email válido para responder.",
      message: "Conte um pouco mais sobre seu projeto (mínimo 10 caracteres).",
    },
    success: "Mensagem enviada! Respondo em menos de 24h.",
    error: "Algo deu errado. Tente novamente.",
  },
  footer: {
    tagline:
      "Portfólio de David, full-stack developer & product builder. Sistemas em produção, não demos.",
    nav: "Navegação",
    systems: "Sistemas",
    contact: "Contato",
    response: "Resposta em 24h úteis",
    available: "Disponível",
    madeWith: "Feito com",
    rights: "Todos os direitos reservados.",
  },
  search: {
    placeholder: "Buscar projetos, posts ou seções…",
    open: "Abrir busca (⌘K)",
    empty: "Sem resultados.",
    short: "Buscar…",
    groups: { nav: "Navegação", projects: "Projetos", blog: "Blog & Novidades" },
  },
  backToTop: "Voltar ao topo",
};

export const dictionaries: Record<Locale, Dict> = { es, pt };
