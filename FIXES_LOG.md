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
