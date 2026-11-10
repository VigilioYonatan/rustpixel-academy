# Rust Forge: dirección de arte

Identidad propia: Ferris, cangrejo naranja pixelado original para este repositorio, con 6 sprites locales de roles (explorer, student, engineer, debugger, architect, senior). Dos fondos generados localmente (`forge-night.png`, `forge-day.png`), sin dependencias de imágenes remotas. Se incluyen **dos imágenes de concepto anteriores** en `docs/design/references/`, que sirven como inspiración visual y no como capturas del producto funcional.

## Tokens
- Forge Orange #E76F36
- Copper #B84E30
- Dark #171B23
- Light #FFF8F0
- Senior Gold #F2BE58
- Teal #6FC7BD
- Success #68C48C
- Error #E76B76

Tipografía de UI: system-ui; código: Cascadia Code/Consolas/monospace (fallbacks locales). No se distribuyen fuentes binarias. Priorizar contraste, focus visible, 44px targets cuando sea posible, teclado y reduced-motion. WCAG 2.2 AA es objetivo, no conformidad auditada.

## Accesibilidad y responsive
Breakpoints CSS 1120, 760 y 420px. Navegación que puede desplazarse horizontalmente en pantallas angostas; sidebar en fila en móvil. Se requiere auditoría de lector de pantalla, zoom 200%, contraste visual y capturas reales antes de reclamar conformidad.
