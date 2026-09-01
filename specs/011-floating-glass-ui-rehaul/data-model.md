# Data Model & UI State Architecture: Rehaul Visual Flotante

## 1. UI Navigation State Entity

```typescript
interface SectionNavItem {
  id: string;        // Target DOM element id (e.g., "sec-overview-kpis")
  label: string;     // Clean human-readable label
  icon: string;      // Lucide icon identifier
}

interface TabSectionConfig {
  title: string;     // Module display title
  sections: SectionNavItem[];
}

type TabSectionMap = Record<string, TabSectionConfig>;
```

### Registered Modules & Sub-sections
- `tab-portal`: Misión & Principios, KPIs Ejecutivos Flash, Mapa del Portal
- `tab-overview`: KPIs Principales, Simulador Asimetría, Proyección Huelga, Cotización AIR.PA, Solvencia & Dividendos
- `tab-industrial`: Termómetro de Presión, Flota Beluga en Tierra, Vuelos & Retención HTP, Monitor de Envíos JIT, Cuello de Botella FALs
- `tab-purchasing-power`: Simulador Multivariante, Efecto Abril & IPC, Comparativa Escenarios, Desglose Beneficios & ROI, Pérdidas 2020-2025 (BOE), Mesa de Negociación
- `tab-union-force`: Representación Sindical, Referéndum 24-Julio, Secciones Sindicales, Claves Sociológicas, Línea Temporal & Minutas, Árboles de Decisión
- `tab-evidence`: Fuentes Primarias (269+), Canal Telegram & Docs, Benchmark Conflictos

---

## 2. Invariant & Econometric State Entities

```typescript
interface ConflictMetrics {
  parameters: {
    total_workers_spain: number;       // Invariant: 15,562
    total_delegates_spain: number;     // Invariant: 198
    daily_cost_airbus_millions: number;// Invariant: 22.7 M€/day
    stock_price_eur: number;           // Invariant: 203.05 €
    stock_loss_millions: number;       // Invariant: -14,459.5 M€
  };
  referendum_2026_07_24: {
    total_census: number;              // 15,562
    total_votes: number;               // 12,674 (81.44% turnout)
    no_votes: number;                  // 6,229 (49.15%)
    yes_votes: number;                 // 5,860 (46.24%)
    blank_votes: number;               // 412
    null_votes: number;                // 173
  };
  airbus_financials_2025: {
    revenue_billion: number;           // 73.4 B€
    ebit_adjusted_billion: number;     // 7.1 B€
    net_profit_million: number;        // 4,960 M€
    dividend_per_share: number;        // 3.20 €/sh (2,535 M€ total)
  };
}
```
