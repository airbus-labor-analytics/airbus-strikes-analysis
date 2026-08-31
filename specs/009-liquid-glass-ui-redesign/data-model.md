# Data Model & UI State Architecture: Rediseño Liquid Crystal & AMOLED Black

**Feature**: `009-liquid-glass-ui-redesign`  
**Date**: 2026-08-31  
**Status**: Completed

---

## 1. Modelo de Estado del Frontend (Client-Side UI State)

El estado reactivo de la interfaz se gestiona en memoria en el controlador principal (`dashboard/app.js`) sin persistencia externa innecesaria, complementado por los parámetros de URL (hash routing):

```typescript
interface DashboardUIState {
  // 1. Navegación y Enrutamiento Activo
  navigation: {
    activeTab: "tab-portal" | "tab-overview" | "tab-industrial" | "tab-purchasing-power" | "tab-union-force" | "tab-evidence";
    previousTab: string | null;
    scrollThresholdCrossed: boolean; // True si window.scrollY > 120px
  };

  // 2. Estado de Elementos Flotantes
  floatingHUD: {
    visible: boolean;
    compactMode: boolean;
    activeMetricHighlight: "loss" | "days" | "workers";
  };

  // 3. Estado del Drawer Lateral (Calculadora Rápida)
  calculatorDrawer: {
    isOpen: boolean;
    baseSalary: number;       // Default: 50,000 €
    ipcRate: number;          // Default: 0.025 (2.5%)
    strikeDays: number;       // Default: 5
    teleworkDays: number;     // Default: 2
    quinquenios: number;      // Default: 1
    appliesEfectoAbril: boolean; // Default: false
  };

  // 4. Parámetros de Diseño & Tokens Activos
  theme: {
    mode: "amoled-black";
    glassIntensity: "high-fidelity"; // blur(24px) + specular border
    colorTheme: "aero-industrial";   // cyan/emerald/amber/rose glows
  };
}
```

---

## 2. Entidades Visuales y Componentes DOM

### 2.1. Dynamic Island HUD (`#floating-hud`)
- **ID del Contenedor**: `floating-hud`
- **Atributos**:
  - Posición: Fija centrada en la parte superior.
  - Hijos interactivos:
    - `#hud-days-counter`: Días transcurridos de conflicto.
    - `#hud-loss-counter`: Pérdida de capital calculada para Airbus SE en M€.
    - `#hud-tab-switcher`: Botones miniatura para cambio rápido de pestaña.
    - `#hud-calc-trigger`: Botón con icono de calculadora para abrir el Drawer lateral.

### 2.2. Quick Calculator Drawer (`#quick-calc-drawer`)
- **ID del Contenedor**: `quick-calc-drawer`
- **Backdrop**: `drawer-backdrop`
- **Controles Sincronizados**:
  - `drawer-salary-input` (Slider / Number) ↔ Sincronizado con `sim-salary`
  - `drawer-ipc-input` (Slider / Number) ↔ Sincronizado con `sim-ipc-rate`
  - `drawer-strike-days` (Slider / Number) ↔ Sincronizado con `sim-strike-days`
- **Métricas de Retorno Rápido en Drawer**:
  - `drawer-roi-amortization`: Tiempo de amortización del paro en semanas/meses.
  - `drawer-roi-5yr-gain`: Ganancia neta proyectada a 5 años.
  - `drawer-monthly-gain`: Incremento neto mensual ganado en nómina.

### 2.3. Tarjeta de Cristal Líquido (`.glass-card-crystal`)
- **Clase CSS Base**: `glass-card` / `glass-card-crystal`
- **Tokens de Borde**:
  - `border-glass`: Borde de `1px solid rgba(255, 255, 255, 0.08)`.
  - `border-t-specular`: Borde superior iluminado `1px solid rgba(255, 255, 255, 0.16)`.
- **Efectos de Brillo**:
  - `.glow-cyan`: `box-shadow: 0 0 25px -5px rgba(56, 189, 248, 0.15)`.
  - `.glow-emerald`: `box-shadow: 0 0 25px -5px rgba(16, 185, 129, 0.15)`.
  - `.glow-amber`: `box-shadow: 0 0 25px -5px rgba(245, 158, 11, 0.15)`.
  - `.glow-rose`: `box-shadow: 0 0 25px -5px rgba(244, 63, 94, 0.15)`.
