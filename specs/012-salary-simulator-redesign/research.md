# Research: Salary Simulator Redesign

**Branch**: `012-salary-simulator-redesign` | **Date**: 2026-08-31

## R-001: Tooltips accesibles sin librería externa

**Decision**: CSS-only para desktop + mínimo JS touch para móvil.

```css
.math-tip { position:relative; cursor:help; border-bottom:1px dashed rgba(148,163,184,0.4); }
.math-tip .tip-box { display:none; position:absolute; bottom:calc(100% + 6px); left:50%;
  transform:translateX(-50%); width:260px; background:#0f172a;
  border:1px solid rgba(99,102,241,0.4); border-radius:10px; padding:10px 12px;
  z-index:50; font-family:ui-monospace,monospace; font-size:10px; color:#cbd5e1; }
.math-tip:hover .tip-box,
.math-tip:focus .tip-box,
.math-tip.tip-visible .tip-box { display:block; }
```

Touch listener (1 función global):
```js
document.addEventListener('touchstart', e => {
  const tip = e.target.closest('.math-tip');
  document.querySelectorAll('.math-tip.tip-visible').forEach(el => {
    if (el !== tip) el.classList.remove('tip-visible');
  });
  if (tip) tip.classList.toggle('tip-visible');
}, { passive: true });
```

**Rationale**: Cero dependencias, funciona en file://, accesible con teclado vía `:focus`.
**Alternatives**: Tippy.js (dependencia extra), `title` (no HTML), `<dialog>` (overkill).

## R-002: Chart de evolución salarial año a año

**Decision**: Chart.js line chart nuevo `salaryEvolutionChart` con 4 datasets:

| Dataset | Color | Cálculo |
|---------|-------|---------|
| Empresa +5% (nominal) | `#f43f5e` | `S₀×1.05 × (1+min(IPC×0.25, 0.01))^t` |
| SIMA +9.5% (nominal) | `#38bdf8` | `S₀×1.095 × (1+IPC)^t` |
| Comité +12% (nominal) | `#10b981` | `S₀×1.12 × (1+IPC+0.015)^t` |
| Poder real sin RSG (área) | `rgba(100,116,139,0.15)` | `S₀×1.05 / (1+IPC)^t` |

Labels: `['2025 (Base)', '2026', '2027', '2028', '2029', '2030']` — 6 puntos.

**Función nueva**: `updateSalaryEvolutionChart(baseSalary, ipcRate)` llamada desde `updateWageSimulation()`.
**Inicialización**: `initSalaryEvolutionChart()` en `initAllModules()` (antes de `initWagesChart()`).
**Resize**: añadir `salaryEvolutionChart` al handler de `switchTab` junto a los demás charts.

**Alternatives**: SVG manual (más código), reutilizar wagesChart (rompe tests).

## R-003: Eliminación de IDs obsoletos y mapa de sustitución

| ID eliminado | Sustituido por |
|---|---|
| `scen-co-salary`, `scen-co-net-total`, etc. | `sc1-salary-y1`, `sc1-monthly`, `sc1-real-5yr`, `sc1-net-total`, `sc1-loss-badge` |
| `scen-med-*` | `sc2-salary-y1`, `sc2-monthly`, `sc2-real-5yr`, `sc2-net-total` |
| `scen-union-*` | `sc3-salary-y1`, `sc3-monthly`, `sc3-real-5yr`, `sc3-net-total`, `sc3-gain-badge` |
| `ea-loss-q1`, `ea-loss-extra`, `ea-loss-pension`, `ea-loss-total-airbus` | eliminados |
| `ipc-audit-loss-co`, `ipc-audit-gain-union`, `ipc-audit-cum-inflation`, `ipc-audit-gap-5yr` | eliminados |
| `ipc-audit-rate-label` | eliminado |
| `tb-base-cur` … `tb-5yr-diff-real` (tabla 14 filas) | eliminados |
| `tb-prop-co-y1-nom` … `tb-prop-comite-diff` (tabla 5 años) | eliminados |
| `kpi-diff-cgt-5yr`, `kpi-diff-cgt-5yr-real` | eliminados (CGT era 4ª propuesta no real) |
| `kpi-diff-comite-5yr`, `kpi-diff-comite-5yr-real` | preservados |
| `kpi-diff-sima-5yr`, `kpi-diff-sima-5yr-real` | nuevos (antes no existían) |

IDs **preservados sin cambio**: `roi-strike-days-label`, `roi-strike-cost`, `roi-monthly-gain`, `roi-amortization-time`, `roi-5yr-gain`, `sim-salary`, `sim-shift`, `sim-quinquenios`, `sim-pension-rate`, `sim-telework`, `sim-ipc-rate`, `sim-strike-days`, `wagesChart`.
