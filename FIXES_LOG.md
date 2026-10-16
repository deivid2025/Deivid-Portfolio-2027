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

## 2026-10-16 — Fix #2: Agregar "4 SISTEMAS EN PRODUCCIÓN" a la card

**Pedido del usuario:**
"ademas de eso en la card debes agregar ya sistemas en produccion"

**Fix aplicado:**
- Actualicé `scripts/build_card_front.py` para añadir un bloque destacado con el texto **"4 SISTEMAS EN PRODUCCIÓN"** entre el headshot y la fila de logos tech. Usa un badge verde con número "4" grande + label, y debajo el texto completo.
- También actualicé el count de stats en `src/lib/projects.ts` (la card ahora dice 4, no 3).

---
