# UI Contracts & DOM Hierarchy Specifications

**Feature**: `009-liquid-glass-ui-redesign`  
**Date**: 2026-08-31  
**Status**: Completed

---

## 1. Contratos de Elementos DOM Principales

| Elemento / Contenedor | ID Obligatorio | Clases Base Obligatorias | Rol / Comportamiento |
|---|---|---|---|
| **Viewport Raíz** | `body` | `bg-black text-slate-100 font-sans antialiased` | Fondo negro AMOLED absoluto con tipografía anti-aliasing. |
| **Dynamic Island HUD** | `floating-hud` | `fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300` | Barra flotante superior que se muestra con `scrollY > 120px`. |
| **Drawer Backdrop** | `drawer-backdrop` | `fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity` | Capa translúcida de oscurecimiento al abrir el Drawer. |
| **Quick Calculator Drawer** | `quick-calc-drawer` | `fixed top-0 right-0 h-full w-full sm:w-[440px] z-50 transition-transform duration-300` | Panel lateral deslizable con controles salariales rápidos. |
| **Buscador & Filtros HUD** | `hud-search-trigger` | `cursor-pointer p-2 rounded-lg hover:bg-white/10` | Disparador de búsqueda global / salto de sección. |
| **Botón Volver Arriba** | `floating-back-to-top` | `fixed bottom-6 right-6 z-40 p-3 rounded-full transition-all` | Botón circular con icono chevron que aparece con scroll profundo. |

---

## 2. Contratos de Funciones y Controladores JavaScript (`dashboard/app.js`)

### 2.1. Gestión de Elementos Flotantes
```javascript
// Inicialización del listener de scroll para la Dynamic Island y el botón Volver Arriba
function initFloatingHUD(): void;

// Control de apertura y cierre del Drawer lateral
function toggleQuickCalculatorDrawer(open?: boolean): void;

// Sincronización bidireccional entre los controles del Drawer y el Panel 3
function syncDrawerWithMainSimulator(): void;
```

### 2.2. Cumplimiento de Ciclo de Vida y Gráficos (Principio VI)
```javascript
// Conmutación de pestañas con reseteo de viewport y redimensionamiento de lienzos
function switchTab(targetTabId: string): void;
// Contrato:
// 1. Oculta pestañas inactivas y muestra targetTabId.
// 2. Ejecuta window.scrollTo({ top: 0, behavior: 'instant' }).
// 3. Itera sobre todas las instancias de Chart.js activas y llama chart.resize().
// 4. Actualiza el estado visual de los botones de navegación y de la Dynamic Island.
```

---

## 3. Especificación de Reglas CSS de Cristal Líquido (`dashboard/index.html`)

```css
/* Glassmorphism 2.0 Tokens */
.glass-card-crystal {
  background: rgba(10, 10, 14, 0.75);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.6);
}

.glass-pill {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-pill:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}

/* Typography Tabular Numbers */
.font-tabular {
  font-feature-settings: 'tnum' on, 'zero' on;
  font-variant-numeric: tabular-nums;
}
```
