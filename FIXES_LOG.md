# Fix Log — Correcciones anotadas

> Cada corrección que hago a partir de ahora se anota acá con fecha, descripción del problema, causa raíz y fix aplicado. Así queda registro de cada cambio.

---

## 2026-10-16 — Fix #1: Efecto borroso en la tarjeta de presentación del hero

**Síntoma reportado por el usuario:**
"la tarjeta tiene un efecto borroso"

**Causa raíz:**
1. El `Lanyard` (componente 3D) estaba configurado con `finish="glossy"` — el acabado brillante tiene `clearcoat: 1` + `clearcoatRoughness: 0.06` que añade una capa de barniz reflectante que reduce el contraste del texto impreso en la card.
2. La textura `card-front.png` se generaba a 864×1152, pero el Lanyard muestrea la textura a `FACE_WIDTH = 1024`. Eso significa que la textura se **upscalea** de 864→1024 píxeles, perdiendo nitidez.

**Fix aplicado:**
- Cambié `finish="glossy"` → `finish="matte"` en `src/components/portfolio/id-badge.tsx`. El matte tiene `roughness: 0.85, clearcoat: 0` — sin capa de barniz, el texto se ve nítido.
- Regeneré `public/card-front.png` a **1024×1440** (en vez de 864×1152) para que coincida con el `FACE_WIDTH = 1024` del Lanyard. Así no hay upscaling y la textura se ve pixel-perfect.

---

## 2026-10-16 — Fix #2: Stats card del hero "Sistemas en producción"

**Pedido del usuario:**
"ademas de eso en la card debes agregar ya sistemas en produccion"

**Interpretación inicial (INCORRECTA):**
Agregué "4 SISTEMAS EN PRODUCCIÓN" como badge verde en el `card-front.png` (la tarjeta de presentación del hero).

**Corrección del usuario:**
"animal aqui es donde debias colocar 4sistemas en produccion no en mi tarjeta de presentacion tarado corrige eso" + screenshot de la **stats card** del hero (el widget de "3 Sistemas en producción" → "4 Sistemas en producción").

**Fix aplicado (corrección):**
- **Saqué** el badge "4 SISTEMAS EN PRODUCCIÓN" del `scripts/build_card_front.py` y regeneré `public/card-front.png` sin ese bloque.
- El lugar correcto del "4 Sistemas en producción" es en la **stats card del hero** (el grid de 4 métricas: sistemas / líneas / tecnologías / años). Eso ya estaba arreglado en `hero.tsx` (value "4") y `i18n.ts` (badge del hero "Portfolio · 4 sistemas en producción").

**Lección anotada:** Cuando el usuario dice "card", puede referirse a la stats card del hero (widget de métricas), NO necesariamente a la tarjeta de presentación (ID badge del hero). Siempre pedir confirmación visual si hay ambigüedad.

---

## Pendiente de revisión

- Verificar que la tarjeta de presentación (ID badge) se vea nítida (no borrosa) en móvil también — el finish matte + textura 1024×1440 debería haberlo resuelto, pero falta verificación móvil.

---

## 2026-10-21 — Fix #3: Modal overflow on mobile (footer clipped below viewport)

**Síntoma reportado por el usuario:**
"hay bug en la seccion de ver detalle en las crad en el movil en la seccion de devlog y novedades se rompen o se desborden favor corregir eso ahora mismo [...] vea que en ningun parte hay ese bug en moviles laptops o computadores"

**Causa raíz:**
En ambos modales (ProjectModal y UpdateModal), el contenido apilado verticalmente sumaba más altura que el max-h-[90vh] del modal:
- banner (~217px) + header (~70px) + scroll area (max-h-[70vh]=591px) + footer (~57px) = ~935px
- modal max-h-[90vh] = 760px en iPhone 14 (844px viewport)
- Resultado: el footer se empujaba ~175px por debajo del bottom del modal, y `overflow-hidden` lo recortaba → los botones "Visitar / Compartir / Cerrar" no se veían en móvil.

**Fix aplicado:**
- `DialogContent`: cambié de `grid` (default de shadcn/ui) a `flex flex-col` para que los children se apilen verticalmente y el scroll area pueda flexar.
- `motion.div`: agregué `flex min-h-0 min-w-0 flex-col` para que el grid item pueda encojerse y los children puedan flexar.
- Scroll area: reemplacé `max-h-[70vh]` por `flex-1 min-h-0` — así toma el espacio restante entre header y footer, en vez de un valor fijo que chocaba con el resto.
- Aplicado a `src/components/portfolio/project-modal.tsx` y `src/components/portfolio/updates.tsx`.

**Verificación:**
- Móvil 390×844: modal h=760, scroll area h=425 (dentro del modal), footer visible (top=752, bottom=802). ✅
- Tablet 768×1024: modal h=870, fits viewport (bottom 947 ≤ 1024). ✅
- Desktop 1440×900: modal h=810, fits viewport (bottom 855 ≤ 900). ✅
- VLM confirmó en los 3 viewports: footer buttons visibles, texto completo, sin recortes.

---

## 2026-10-22 — Fix #4: Card color + modal footer buttons

**Síntomas reportados por el usuario:**
"verifica que el boton de abrir rpoyecto compartir y cerrar se ven muy fea vas a verificar todas las crad si en elgun lado hay desborde o se ven feas en movil y en toda la web [...] el color de la card de David garay se ve difuminada o borrosa corregir eso y que tenga el mismo color de la paleta de la web no negro oscuro como la que teine hoy dia"

**Causa raíz:**
1. ID badge card surface usaba color puro `#0a0a0a` (10,10,10), que era MÁS OSCURO que el `--background` de la página (12,12,12). El card se veía hundido en el fondo en vez de elevado.
2. Footer de los modales (project-modal.tsx + updates.tsx) usaba `flex flex-wrap` con 3 buttons de `h-8` (32px) — en móvil los botones se aplastaban, hacían wrap a 2 líneas, y se veían feos. Variantes inconsistentes (default/outline/ghost) creaban peso visual desbalanceado.

**Fix aplicado:**
1. **Color de la card** (`scripts/build_card_front.py`):
   - Cambié `BG` de `(10, 10, 10)` → `(22, 23, 28)` (~#16171C) — ligeramente más claro que el page bg, con leve tinte azul (cool gray) para matchear la paleta oklch(0.16 0.002 240) del website.
   - Actualicé `Lanyard cardColor` prop de `#0a0a0a` → `#16171c` (mismo color que la textura del card-front.png).
   - Cambié green accent a `RGB(52, 211, 153)` (emerald-400, matching palette, no warm tones).
2. **Footer de los modales** (`project-modal.tsx` + `updates.tsx`):
   - Removí `flex flex-wrap` y `overflow-hidden`.
   - Nuevo layout single-row: CTA primario `flex-1` (toma el espacio restante en móvil, fixed-width en desktop), botones secundarios `shrink-0 h-10` con icon-only en móvil + texto en sm+.
   - Toqué view count: solo visible en sm+ (`hidden sm:flex`).
   - Mismo patrón aplicado al devlog modal (Compartir + Cerrar).
3. **Auditoría completa** vía agent-browser + VLM:
   - **Mobile 390×844**: revisé las 9 secciones (hero, work, about, services, process, certs, blog, faq, contact). VLM confirmó: "All sections look fine on mobile".
   - **Desktop 1440×900**: revisé 7 secciones. VLM confirmó: "All sections look fine on desktop".
   - **Body horizontal scroll**: htmlScrollW = clientW = 390 → no hay scrollbar horizontal.
   - Las 2 secciones con scrollWidth > clientWidth (`#top` y `#stack`) tienen `overflow:hidden` visual clipping — son decorativos (ShapeWaves dot grid + radial glow), no causan scroll visible.

**Verificación VLM:**
- ID badge card: "not pure black, matches website palette, slightly lighter than page bg, subtle blue/cool tint, text highly readable" ✅
- Project modal footer (mobile): "cleanly laid out, single row, Abrir proyecto primary CTA takes most space, Compartir + Cerrar compact icon buttons" ✅
- Project modal footer (desktop): "single row, 4 elements aligned, 591 vistas visible at far right" ✅

---

## 2026-10-22 — Fix #5: Card super borrosa (text + barcode illegible)

**Síntoma reportado por el usuario:**
"a simple vista se ve que esta super borrosa corrijela te dije que la crad no seve ni puta mierda vealo por ti mismo o desde el navegador" + screenshot mobile/desktop del card area mostrando text y barcode borrosos.

**Causa raíz:**
El Lanyard WebGL canvas renderizaba al DPR nativo del dispositivo (1x en displays estándar, 2x en Retina). En un display 1x:
- Container: 1000×500 CSS px
- Canvas: 1000×500 actual px (DPR=1)
- Card en pantalla: ~325px tall
- Texture: 1024×1440 px
- **Downsample ratio: 4.4x → blurry text + illegible barcode**

A esto se sumaba:
- `LinearMipmapLinearFilter` default → mipmaps elegían versiones de baja resolución de la textura, blur adicional.
- `size=0.65` → card chica en pantalla.
- `finish="matte"` (roughness 0.85) → surface difusa suavizaba los bordes del text.

**Fix aplicado (3 cambios):**

1. **`Lanyard.tsx` → `makeCanvasTexture`**: desactivé mipmaps (`generateMipmaps = false`) + `minFilter = LinearFilter` + `magFilter = LinearFilter`. La textura ahora se samplea siempre a resolución completa, sin elegir niveles mipmap de baja resolución.

2. **`Lanyard.tsx` → `resize`**: forcé minimum 3x pixel ratio: `Math.max(3, Math.min(dpr, 3))`. El canvas ahora renderiza a:
   - Desktop: 3000×1500 actual px (vs 1000×500 antes)
   - Mobile: 768×840 actual px (vs 512×560 antes)
   
   Costo GPU extra aceptable para una sola card 3D.

3. **`id-badge.tsx`**: bump `size` 0.65 → 0.78 (card más grande en pantalla = menos downsample). Switched `finish` "matte" → "glossy" — el clearcoat liso del glossy hace que el text se vea más crisper que la surface difusa del matte.

**Verificación VLM:**

| Viewport | Canvas actual px | Card screen px | Downsample | VLM verdict |
|---|---|---|---|---|
| Desktop 1440×900 | 3000×1500 | ~975 tall | 1.48x | ✅ "barcode sharp, text crisp, photo clear details" |
| Mobile 390×844 | 768×840 | ~210 tall | 1.18x | ✅ "barcode sharp distinct lines, name crisp and highly legible, logos rendered clearly" |

**Lección anotada:** Cuando un texture 3D se ve blurry, las causas típicas son (en orden): mipmapping agresivo, DPR bajo del canvas, texture chica vs screen size. Siempre verificar el ratio `texture_size / screen_size` — si > 3x, va a verse blurry sin imports del filter.

---

## 2026-10-22 — Feature: Visitor tracking (país + dispositivo)

**Pedido del usuario:**
"ahora quiero ver de que pais me estan visitando corrihe eso por favor y registra los dispositivos mas pais"

**Feature implementada:**

1. **Prisma `Visitor` model** (schema.prisma):
   - `ipHash` unique (SHA-256 of `IP + daily_salt + deviceType`) — para deduplear por (IP, día, dispositivo) sin guardar la IP cruda
   - `country` (ISO 3166-1 alpha-2: PY, AR, US…), `countryName`, `city`, `region`
   - `deviceType` (mobile/tablet/desktop/bot), `os`, `browser`
   - `visits` counter, `firstSeenAt`, `lastSeenAt`
   - Indexed por country/deviceType/lastSeenAt

2. **API `/api/visitors/track` (POST)**:
   - Extrae IP de `X-Forwarded-For` o `X-Real-IP`
   - Geolocaliza con `ip-api.com` (gratis, sin API key, 45 req/min)
   - Parsea User-Agent → deviceType/OS/browser (sin lib externa)
   - Upsert por ipHash (incrementa visits + actualiza lastSeenAt)
   - Cachea la geolocation por IP por request

3. **API `/api/visitors/stats` (GET, admin-only)**:
   - Aggrega todos los Visitor rows en JS (sin GROUP BY raw SQL)
   - Devuelve: totals (totalVisits, uniqueVisitors, 24h, 7d), topCountries, topDevices, topOs, topBrowsers

4. **VisitorTracker client component**:
   - Mount: dispara un solo POST por sesión (throttled via sessionStorage)
   - Usa sendBeacon o fetch con keepalive para sobrevivir page unloads
   - Delay 1.5s para no bloquear first paint

5. **Admin dashboard — tab "Visitantes"**:
   - 4 totals cards: visitas totales / 24h / 7d / # países
   - 4 bar lists con progress bars animados:
     - Países con flags 🇵🇾🇦🇷🌐
     - Dispositivos (mobile/tablet/desktop/bot)
     - OS (Windows/macOS/Android/iOS/Linux…)
     - Browsers (Chrome/Safari/Firefox/Edge/Opera…)
   - Privacy note abajo explicando el salted-hash approach

**Privacidad:**
- IP cruda NUNCA se guarda. Se hashea con SHA-256 + sal diaria.
- La sal rota por día → una IP que visita hoy y mañana se trackea como 2 rows distintos (uno por día), pero la IP cruda nunca se puede derivar del hash.
- Si el mismo IP usa 2 dispositivos, se trackea como 2 rows distintos (deviceType está incluido en el hash) → preserva la distribución por dispositivo.

**Verificación:**
- curl con UA iPhone (Android), Mac Edge, Mac Chrome → todas las requests se trackearon correctamente.
- Stats API devolvió: 5 visitas totales, 2 unique, desktop 3 + mobile 2, macOS 5, Edge 3 + Chrome 2.
- Admin Visitantes tab renderiza los 4 bar lists con progress bars animados.
- VLM confirmó: 'macOS 5 (100%); Edge 3 (60%), Chrome 2 (40%)'.

---

## 2026-10-22 — Feature: GymBro Trainer como 5to proyecto

**Pedido del usuario:**
"bien agrega esta app ahora : https://gymbrotraine.deividtech.cloud/ https://github.com/deivid2025/gymbrotraine... portada."
+ uploaded screenshot (1341×623) de la app GymBro.

**Feature implementada:**

1. **Screenshot**: copiada a `/public/screenshots/gymbro-trainer.png` (78KB, 1341×623).

2. **Nuevo proyecto** en `src/lib/projects.ts`:
   - slug: `gymbro-trainer`
   - name: GymBro Trainer
   - tagline: Guía de ejercicios ilustrada con prescripción científica y mapas musculares interactivos
   - category: Producto SaaS, status: live, year: 2026
   - url: https://gymbrotraine.deividtech.cloud/
   - 6 features (302 ejercicios, prescripción científica, mapa muscular, calorías, español LATAM, sin login)
   - metrics: Ejercicios 302, Idioma ES LATAM, Mapas musculares Sí, Cuentas 0
   - techStack: Next.js, React, TypeScript, Tailwind, Canvas API, Local Storage
   - icon: Dumbbell

3. **Icon mapping**: añadido `Dumbbell` a `dynamic-icon.tsx` MAP + import desde lucide-react.

4. **Stats actualizadas a 5 sistemas**:
   - `hero.tsx`: value "4" → "5"
   - `about.tsx`: value "4" → "5"
   - `i18n.ts` ES: badge "4 sistemas" → "5 sistemas", "cuatro" → "cinco"
   - `i18n.ts` PT: badge "4 sistemas" → "5 sistemas", "quatro" → "cinco"
   - `projects.ts` profile.stats: 4 → 5

5. **Socials**: añadido GymBro a `profile.socials` con icon Dumbbell.

6. **Bug fix** en `src/lib/repo.ts` `ensureProjectSeeds()`:
   - Antes: solo hacía upsert si el count era 0 (DB vacío). Como el DB ya tenía 4 proyectos, GymBro no se insertaba.
   - Ahora: siempre upsertea todos los proyectos del seed list. Idempotente — los view counts y campos editados via admin se preservan porque `upsert.update` solo toca las columnas listadas.
   - Esto también arregla el problema para futuras apps: agregar a `projects.ts` → aparece automáticamente en la API + admin.

**Verificación:**
- `GET /api/projects`: ahora devuelve 5 proyectos (antes 4). Slugs: factusheet-oboroscan, notesapp-uchiha, gymbro-trainer, despega-peelme, redline.
- agent-browser: card visible en la grilla de proyectos con screenshot real (gym app interface), nombre "GymBro Trainer", categoría "2026 · PRODUCTO SAAS", descripción completa, tech badges (Next.js, React, TypeScript, Tailwind CSS, Canvas API), highlights, botones "Ver detalle" + "Visitar ↗", view count "0 vistas".
- Hero pill badge: "Portfolio · 5 sistemas en producción" ✅
- VLM confirmó: "302 ejercicios ilustrados, prescripción científica por objetivo, mapa muscular interactivo, 100% español LATAM" visibles en la card.

---

## 2026-10-22 — Fix #6: Faltó agregar el link de GitHub del GymBro Trainer

**Pedido del usuario (reciente):**
"oye te di algunas ordenes"

**Lo que pasó:**
En el mensaje anterior el usuario pasó 2 URLs juntas:
> "agrega esta app ahora : https://gymbrotraine.deividtech.cloud/ https://github.com/deivid2025/gymbrotraine... portada."

Yo interpreté que solo había que agregar la app con la portada (screenshot). Me olvidé del segundo link (el repo de GitHub) que el usuario pasó como dato para incluir en la card del proyecto.

**Fix aplicado:**
1. **`Project` interface** (`src/lib/projects.ts`): agregué campo opcional `github?: string`.
2. **GymBro Trainer entry**: `github: "https://github.com/deivid2025/gymbrotraine"`.
3. **Prisma `ProjectRow` model**: agregué columna `github String?` (nullable para los otros 4 proyectos que no tienen repo público).
4. **`bun run db:push`**: schema migrado + Prisma client regenerado.
5. **`repo.ts` `ensureProjectSeeds`**: propaga `p.github ?? null` en upsert.
6. **`repo.ts` `getProjectRows`**: expone `r.github ?? undefined` en la API response.
7. **`project-modal.tsx` footer**: cuando `project.github` está seteado, rendero un botón "Ver código" outline con icono de Github entre el "Abrir proyecto" (primario) y "Compartir" (secundario). En desktop muestra icono + texto; en mobile es icon-only para ahorrar espacio horizontal.

**Verificación:**
- `GET /api/projects` ahora devuelve `github` solo para GymBro Trainer (los otros 4 quedan sin `github`, lo que es correcto — son repos privados o no aplicable).
- Modal de GymBro: footer ahora tiene 4 botones (Abrir proyecto / Ver código / Compartir / Cerrar) + view count a la derecha en desktop.
- Click en "Ver código" → abre https://github.com/deivid2025/gymbrotraine en nueva tab.

**Lección anotada:** Cuando el usuario pasa múltiples URLs en un mismo mensaje, cada una suele ser un dato distinto para incorporar al proyecto. Si una URL es de GitHub, agregarla al campo `github` del proyecto para que se pueda "ver el código". Si el usuario dice "te di algunas órdenes", revisar el mensaje anterior con cuidado — probablemente hay URLs o instrucciones que pasé por alto.

---

## 2026-10-28 — Fix #7: GitHub URL + Labs URL + email forwarding

**Pedido del usuario:**
"lo que no me has actualizado es mi redireccion de github es esta mi cuenta oficial: https://github.com/deivid2025/ en el footer ambos url cambiar por las mencionadas: https://labs.deividtech.cloud/ en portfolio colocar esta url ademas de eso como hacemos en el newsteller para que me envien directamente ami correo los mensajes que me van llegando o eso en el admin me llega todo verifica e informame como se esta manejando eso, sigue puliendo los detalles tecnicos"

**Cambios aplicados:**

### 1. GitHub URL → oficial
| Antes | Ahora |
|---|---|
| `profile.github = "https://github.com/deividtech"` | `"https://github.com/deivid2025/"` |
| `profile.githubUser = "deividtech"` | `"deivid2025"` |
| `profile.socials[0].url = "https://github.com/davidgaray849"` | `"https://github.com/deivid2025/"` |

### 2. Labs URL en portfolio
- `profile.socials` agregué entrada: `{ label: "Labs", url: "https://labs.deividtech.cloud/", icon: "FlaskConical" }`
- DynamicIcon map: nuevo icon `FlaskConical` (matraz de laboratorio) — combina con el concepto de "Labs".
- Visible en el footer del portfolio en la columna "Sistemas" entre GitHub/Portfolio y PeelMe.

### 3. Email forwarding (SMTP via nodemailer)
**Estado actual (antes del fix):**
- Formulario de contacto: persistía en DB (tabla `Message`) pero no mandaba email.
- Newsletter: persistía en DB (tabla `Subscriber`) pero no notificaba.
- Solo se veían en `/admin` → tab Mensajes / Subscribers.

**Fix aplicado:**
- `src/lib/email.ts` (nuevo): `forwardContactMessage()` y `forwardSubscriberNotification()` con SMTP configurable por env vars (`SMTP_HOST/PORT/USER/PASS/FROM/TO`). Degrada gracefully cuando no hay env vars — no-op silencioso, no rompe el sitio.
- `src/app/api/contact/route.ts`: disparo `forwardContactMessage()` fire-and-forget (no awaited para no esperar la latencia SMTP). ReplyTo seteado al email del visitante → David hace Reply y le responde directo.
- `src/app/api/subscribe/route.ts`: dispara `forwardSubscriberNotification()` solo cuando es nuevo (no en duplicados, para no spammear).
- `src/app/api/admin/stats/route.ts`: devuelve `emailForwarding.configured + destination`.
- `src/app/admin/page.tsx`: nuevo `EmailForwardingBanner` arriba del StatsRow:
  - Verde cuando SMTP está configurado: "Forwarding de email activo — los mensajes del formulario de contacto y los nuevos suscriptores se envían a davidgaray849@gmail.com".
  - Ámbar cuando no: instrucciones completas + template de `.env` + link a Google App Passwords.

**Verificación:**
- Footer: GitHub = `https://github.com/deivid2025/`, Labs = `https://labs.deividtech.cloud/`.
- Admin banner: ámbar, con template de env vars + link a App Passwords.
- POST /api/contact (sin SMTP configurado): 200, persiste en DB, forward no-op silencioso (no error).
- POST /api/subscribe (email nuevo): 200, persiste, duplicate=false, forward no-op silencioso.
- POST /api/subscribe (email existente): 200, persiste, duplicate=true, NO dispara forward (no spammear).

**Para activar el email forwarding, David necesita agregar a `.env`:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=tu-app-password  # NO la password regular
SMTP_FROM=Portfolio <tu-correo@gmail.com>  # opcional
SMTP_TO=davidgaray849@gmail.com  # opcional
```

Para Gmail: hay que crear una App Password en https://myaccount.google.com/apppasswords (la password regular NO funciona por seguridad).

---
