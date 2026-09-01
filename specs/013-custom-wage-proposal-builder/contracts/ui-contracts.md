# UI Contracts: Custom Wage Proposal Builder & Comparator

**Branch**: `013-custom-wage-proposal-builder` | **Date**: 2026-09-01

## 1. DOM Hierarchy Contract (Tab 3: `#tab-purchasing-power`)

```
#tab-purchasing-power
  +-- #sec-wages-simulator (glass-card)
  |     +-- Simulator Header (Title, Share, Copy)
  |     +-- Global Inputs Grid (Salary, Group, Shift, Quinquenios, Telework, Pension, IPC Slider + Presets)
  |
  +-- #sec-wages-scenarios (grid grid-cols-1 md:grid-cols-3)
  |     +-- Card 1: Oferta Patronal Airbus SE (+5,0% fraccionado)
  |     +-- Card 2: Plataforma del Comité (+12,0% en tablas) [Highlighted]
  |     +-- Card 3: Tu Propuesta Personalizada (Interactive Builder)
  |           +-- Preset Buttons Row (Pérdida Cero, Recuperación 2030, Equilibrio)
  |           +-- In-Card Control Grid:
  |           |     +-- #custom-raise-input / #custom-raise-slider (% subida)
  |           |     +-- #custom-arrears-input (€ atrasos)
  |           |     +-- #custom-rsg-select (Modo RSG: Sin linkado, 100% IPC, IPC + Margen)
  |           |     +-- #custom-cap-select (Tope: Sin tope, 3%, 4%, 5%)
  |           +-- Live Output Metrics with .math-tip popups (#sc-custom-salary-y1, #sc-custom-monthly, #sc-custom-real-5yr, #sc-custom-net-total)
  |
  +-- #sec-wages-roi (grid grid-cols-1 lg:grid-cols-3)
  |     +-- Strike ROI Calculator (#roi-strike-cost, #roi-monthly-gain, #roi-amortization-time, #roi-5yr-gain)
  |     +-- KPI Diff 1: Plataforma Comité vs. Empresa (+5%) (#kpi-diff-comite-5yr, #kpi-diff-comite-5yr-real)
  |     +-- KPI Diff 2: Tu Oferta vs. Empresa (+5%) (#kpi-diff-custom-5yr, #kpi-diff-custom-5yr-real)
  |
  +-- #sec-wages-chart-evolution
  |     +-- #salaryEvolutionChart (4 series: Empresa, Tu Oferta, Comité, Real deflactado)
  |
  +-- #sec-wages-chart-cumulative
        +-- #wagesChart (4 series: Empresa, Tu Oferta, Comité, Sin Huelga)
```

---

## 2. Element ID Naming Standards

| Element ID | Tipo | Función |
|---|---|---|
| `#custom-raise-slider` | `<input type="range">` | Control deslizante de subida inicial (0 a 25%) |
| `#custom-raise-badge` | `<span>` | Lectura numérica de la subida inicial seleccionada |
| `#custom-arrears-input` | `<select>` o `<input>` | Selector de atrasos retroactivos (0 € a 15.000 €) |
| `#custom-rsg-mode` | `<select>` | Selector de cláusula de revisión salarial |
| `#custom-rsg-margin` | `<input type="number">` | Margen $\pm \Delta\%$ respecto al IPC |
| `#custom-cap-mode` | `<select>` | Selector de tope máximo anual a la revisión |
| `#sc-custom-salary-y1` | `<strong>` | Salario bruto Año 1 resultante |
| `#sc-custom-monthly` | `<strong>` | Incremento neto mensual resultante en nómina |
| `#sc-custom-real-5yr` | `<strong>` | Salario real deflactado en el Año 5 y % de poder adquisitivo |
| `#sc-custom-net-total` | `<strong>` | Beneficio neto total de bolsillo en el Año 1 |
| `#kpi-diff-custom-5yr` | `<span>` | Diferencial acumulado nominal a 5 años vs. Empresa |
| `#kpi-diff-custom-5yr-real`| `<span>` | Diferencial acumulado real a 5 años vs. Empresa |
