# UI Contracts: Salary Simulator Redesign

**Branch**: `012-salary-simulator-redesign` | **Date**: 2026-09-01

## 1. DOM Hierarchy Contract (Tab 3: `#tab-purchasing-power`)

```
#tab-purchasing-power
  └── #sec-wages-simulator (glass-card)
        ├── Simulator Header + Actions (Share, Copy, VII Convenio badge)
        ├── Multi-variable Inputs Grid (5 columns: salary, category+seniority, shift+telework, strike days+pension, IPC range)
        ├── #sec-wages-scenarios (3 columns: Empresa, SIMA, Comité)
        │     ├── Card 1 (Empresa): #sc1-salary-y1, #sc1-monthly, #sc1-real-5yr, #sc1-net-total, #sc1-loss-badge
        │     ├── Card 2 (SIMA):    #sc2-salary-y1, #sc2-monthly, #sc2-real-5yr, #sc2-net-total
        │     └── Card 3 (Comité):  #sc3-salary-y1, #sc3-monthly, #sc3-real-5yr, #sc3-net-total, #sc3-gain-badge
        ├── #sec-wages-roi (Grid: Left ROI Calculator, Right 2 Differential KPI Cards)
        │     ├── ROI Card: #roi-strike-days-label, #roi-strike-cost, #roi-monthly-gain, #roi-amortization-time, #roi-5yr-gain
        │     └── Differential Cards: #kpi-diff-comite-5yr, #kpi-diff-comite-5yr-real, #kpi-diff-sima-5yr, #kpi-diff-sima-5yr-real
        └── #sec-wages-chart-evolution (New Chart: Salary Evolution Year by Year 2025-2030)
              └── canvas#salaryEvolutionChart
```

## 2. JavaScript Interface Contract (`dashboard/app.js`)

### `updateWageSimulation()`
Updates all reactive elements when inputs change:
1. Reads input elements: `#sim-salary`, `#sim-category`, `#sim-quinquenios`, `#sim-shift`, `#sim-telework`, `#sim-strike-days`, `#sim-pension-rate`, `#sim-ipc-rate`.
2. Computes scenario metrics for Empresa (+5%), SIMA (+9.5%), Comité (+12%).
3. Populates DOM elements via `setText()`:
   - `sc1-*`, `sc2-*`, `sc3-*`
   - `roi-*`
   - `kpi-diff-*`
4. Calls `updateSalaryEvolutionChart(curSalary, ipcRate)` to refresh `salaryEvolutionChart`.
5. Calls `updateWagesChart(curSalary, ipcRate)` to refresh `wagesChart` (legacy cumulative).
6. Syncs URL state via `syncSimulatorURL(...)`.

### `initSalaryEvolutionChart()`
Initializes the Chart.js line chart instance on `#salaryEvolutionChart`:
- **Labels**: `['2025 (Base)', '2026 (Año 1)', '2027 (Año 2)', '2028 (Año 3)', '2029 (Año 4)', '2030 (Año 5)']`
- **Datasets**:
  1. `Plataforma Comité (+12% + IPC+1.5% RSG)`: Green (`#10b981`), solid, 3px.
  2. `Preacuerdo SIMA (+9.5% + 100% IPC)`: Sky Blue (`#38bdf8`), solid, 2.5px.
  3. `Oferta Empresa (+5% sin RSG)`: Rose (`#f43f5e`), solid, 2.5px.
  4. `Poder Compra Real Empresa (Deflactado)`: Slate (`#64748b`), dashed line + subtle background fill (`rgba(100, 116, 139, 0.12)`).

### `updateSalaryEvolutionChart(baseSalary, ipcRate)`
Recalculates 6-year trajectory points and updates the dataset arrays in `salaryEvolutionChart`.
