---
name: pixel-senior-ux
description: Sistema visual Pixel Senior UX/UI: combina tipografía pixel Silkscreen auto-alojada en acentos, numerales 01/02/03 y micro-animaciones stepped con prosa legible en DM Sans/Space Grotesk e iconos SVG pixel-art 16x16 crispEdges.
---
# Pixel Senior UX/UI Skill

## Cuándo aplicar tipografía Pixel (`"Silkscreen"`)
- **SÍ usar `"Silkscreen"` (con moderación):**
  - Numerales de fondo / watermarks (`01`, `02`, `03` en `.level-ghost-num`, `.level-icon span`, `.senior-card-num`).
  - Contadores KPI cortos (`18`, `240h`, `13`, `100/100` en `.stats-strip strong`, `.intro-stat strong`, `.sr-score strong`, `.senior-stats strong`).
  - Micro-etiquetas tipo `kicker`, `eyebrow` o badges de estado (`RPO · RTO`, `ADR · SRE`, `.eyebrow`, `.tag.gold`, `.gate-id`).
- **NO usar `"Silkscreen"`:**
  - Párrafos, explicaciones técnicas, opciones de quiz, formularios ni código (`DM Sans`, `Space Grotesk` y `ui-monospace`/`JetBrains Mono` garantizan lectura sin fatiga).

## Iconografía Pixel-Art en Navbar (`16x16`)
- Usar `shape-rendering="crispEdges"` sobre rejilla entera `viewBox="0 0 16 16"`.
- Conservar `currentColor` para integrarse en tema oscuro/claro y reserva de dorado (`--gold`) en el icono corona de **Senior Mode**.
- Mantener áreas táctiles `>= 44px` en móvil.

## Animaciones Pixel (`steps`)
- Usar transiciones discretas (`steps(2, end)` o `steps(4)`) para cursores parpadeantes (`pixelBlink`), pulso de corona/badges y hover de tarjetas.
- Desactivar obligatoriamente animaciones bajo `[data-motion="reduced"]`, `[data-reduced-motion="true"]` y `@media (prefers-reduced-motion: reduce)`.
- Prohibido cargar fuentes desde CDNs externos (usar siempre `/fonts/silkscreen-latin.woff2` local bajo CSP estricta).
