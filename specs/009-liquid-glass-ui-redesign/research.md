# Research & Architectural Decisions: Rediseño Visual "Liquid Crystal" & AMOLED Black

**Feature**: `009-liquid-glass-ui-redesign`  
**Date**: 2026-08-31  
**Status**: Completed

---

## 1. Sistema de Diseño Visual y Paleta AMOLED Black

### Decisión 1.1: Paleta de Colores y Capas de Elevación
- **Decisión**: Fondo base **AMOLED Black puro (`#000000`)**, con niveles de elevación translúcidos basados en `rgba` y variables CSS nativas.
- **Tokens de Color**:
  - `bg-amoled`: `#000000` (Fondo viewport principal)
  - `surface-glass-1` (Tarjetas y Contenedores): `rgba(10, 10, 12, 0.72)` con `backdrop-filter: blur(24px) saturate(180%)`
  - `surface-glass-2` (Sub-paneles y Rejillas internas): `rgba(15, 17, 23, 0.65)` con `backdrop-filter: blur(16px)`
  - `surface-glass-hud` (Dynamic Island & Drawer): `rgba(5, 6, 8, 0.85)` con `backdrop-filter: blur(32px) saturate(200%)`
  - `border-glass`: `1px solid rgba(255, 255, 255, 0.08)` con resaltado superior `rgba(255, 255, 255, 0.16)`
  - `accent-cyan` (Aero-Telemetría): `#38bdf8` / Glow `rgba(56, 189, 248, 0.25)`
  - `accent-emerald` (Ganancias Sindicales / Acuerdo): `#10b981` / Glow `rgba(16, 185, 129, 0.25)`
  - `accent-amber` (Alertas / SIMA / Inflación): `#f59e0b` / Glow `rgba(245, 158, 11, 0.25)`
  - `accent-rose` (Pérdidas / Oferta Patronal / Destrucción Bursátil): `#f43f5e` / Glow `rgba(244, 63, 94, 0.25)`
- **Alternativas descartadas**:
  - Fondos grises tradicionales (`#0f172a` / `#1e293b`): Descartados por carecer del contraste extremo y la elegancia "amoled luxury" de Linear y Raycast.

---

## 2. Tipografía "Aesthetics" y Legibilidad Tabular

### Decisión 2.1: Pila Tipográfica Híbrida
- **Decisión**: Integrar una combinación de fuentes web de vanguardia cargadas vía CDN con fallback de contingencia en fuentes nativas del sistema operativo para funcionamiento 100% offline:
  - **Textos y Títulos**: `font-sans: 'Geist Sans', 'Inter Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;` con `letter-spacing: -0.02em` en titulares para un acabado editorial compacto.
  - **Datos Numéricos, Salarios y Tablas**: `font-mono: 'Geist Mono', 'JetBrains Mono', 'SF Mono', Consolas, Menlo, monospace;` con `font-feature-settings: 'tnum' on, 'zero' on;` para asegurar que todas las cifras ocupen el mismo ancho exacto.
- **Alternativas descartadas**: Fuentes exclusivamente locales empaquetadas en WOFF2 (añaden peso innecesario al repo) o fuentes genéricas predeterminadas del navegador (rompen la estética moderna).

---

## 3. Elementos Flotantes e Interactividad (HUD, Dynamic Island & Drawer)

### Decisión 3.1: Dynamic Island y Control de Scroll
- **Decisión**: Implementar un contenedor flotante `#floating-hud` posicionado en `fixed top-4 left-1/2 -translate-x-1/2 z-50` con transición de opacidad y escala controlada por `window.addEventListener('scroll', ...)`:
  - Scroll < 120px: Oculto o minimizado sutilmente (`opacity-0 pointer-events-none translate-y-[-10px]`).
  - Scroll >= 120px: Revelado con animación ultra-suave (`opacity-100 translate-y-0 duration-200`).
  - Contenido: Indicador de conflicto (Días transcurridos, Pérdida Airbus M€), Píldoras de conmutación rápida de pestaña y Botón disparador de la Calculadora Rápida.

### Decisión 3.2: Quick Calculator Drawer Lateral (Off-Canvas)
- **Decisión**: `#quick-calc-drawer` posicionado en `fixed top-0 right-0 h-full w-full sm:w-[420px] z-50` con backdrop translúcido `#drawer-backdrop`:
  - Activación: Botón en la Dynamic Island o atajo flotante inferior.
  - Interacción: Sliders reactivos de Salario Base, IPC y Días de Huelga sincronizados bidireccionalmente con el simulador del Panel 3.
  - Cierre: Botón `X`, tecla `Escape` o clic en el backdrop.

---

## 4. Adaptación de Gráficos Chart.js al Modo AMOLED Liquid

### Decisión 4.1: Estilos de Gráficos Oscuros y Tooltips Glass
- **Decisión**:
  - Rejillas: `grid: { color: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.08)' }`
  - Ticks: Tipografía monoespaciada `#64748b` / `#94a3b8`.
  - Tooltips: `backgroundColor: 'rgba(5, 7, 10, 0.92)'`, `borderColor: 'rgba(255, 255, 255, 0.12)'`, `borderWidth: 1`, `backdropFilter: 'blur(12px)'`, con textos formateados con separadores de miles en € / %.
  - Animaciones: Desactivadas (`animation: false`, `duration: 0`) para garantizar visualización instantánea sin latencia según el estándar del proyecto.

---

## 5. Cumplimiento Constitucional (Principio VI)
- **Decisión**: Mantener intacto el gestor resiliente `renderResilientChart()` y la disciplina de ciclo de vida:
  - Todo cambio de pestaña resetea el scroll con `window.scrollTo({ top: 0, behavior: 'instant' })`.
  - Todas las instancias de Chart.js activas ejecutan `.resize()` tras la conmutación para prevenir distorsión en pantallas ultra-panorámicas o móviles.
