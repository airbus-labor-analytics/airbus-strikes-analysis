# Data Model: Salary Simulator Redesign

**Branch**: `012-salary-simulator-redesign` | **Date**: 2026-08-31

## Entities

### SimulatorParams (runtime, no persistido)

| Campo | Tipo | Fuente |
|-------|------|--------|
| `baseSalary` | float | `#sim-salary` input |
| `shift` | string | `#sim-shift` select |
| `quinquenios` | int | `#sim-quinquenios` select |
| `strikeDays` | int | `#sim-strike-days` range |
| `pensionRate` | float | `#sim-pension-rate` select (÷100) |
| `ipcRate` | float | `#sim-ipc-rate` range (÷100) |
| `teleworkDays` | int | `#sim-telework` select |

### ScenarioCard (×3 instancias: sc1, sc2, sc3)

| ID DOM | Concepto | Fórmula |
|--------|----------|---------|
| `sc{n}-salary-y1` | Salario tablas Año 1 | `S₀ × (1 + pct)` |
| `sc{n}-monthly` | Subida neta/mes | `(S₁ − S₀) / 14 × (1 − IRPF)` |
| `sc{n}-real-5yr` | Poder compra real Año 5 | `S₁ × RSG_factor⁴ / (1+IPC)⁴` |
| `sc{n}-net-total` | Beneficio neto Año 1 | `Δsalario_neto + atrasos_netos + Δpensión + Δpluses + teletrabajo + Bradford − efecto_abril` |
| `sc1-loss-badge` | % pérdida real 5 años (Empresa) | `(P₅ / S₀ − 1) × 100` |
| `sc3-gain-badge` | % ganancia real 5 años (Comité) | `(P₅ / S₁ − 1) × 100` |

### SalaryEvolutionChart (canvas: `salaryEvolutionChart`)

| Dataset | RSG factor anual |
|---------|-----------------|
| Empresa (+5%) | `min(IPC×0.25, 0.01)` ← débil, no blindada |
| SIMA (+9,5%) | `IPC` ← mantiene poder adquisitivo |
| Comité (+12%) | `IPC + 0.015` ← ganancia real neta |
| Área poder real sin RSG | `empresa_nominal / (1+IPC)^t` |

Eje X: años 2025–2030 (6 puntos). Eje Y: salario bruto (€/año).

### ROI Block (IDs preservados)

| ID | Concepto |
|----|----------|
| `roi-strike-days-label` | Texto días huelga |
| `roi-strike-cost` | `−(S₀/220 × (1−IRPF) × strikeDays)` |
| `roi-monthly-gain` | `(S₃₁ − S₀) / 14 × (1−IRPF)` (propuesta Comité) |
| `roi-amortization-time` | `roi-strike-cost / roi-monthly-gain` (meses) |
| `roi-5yr-gain` | ganancia neta acumulada 5 años Comité vs base |

### KPI Diferencial (2 cards)

| ID | Concepto |
|----|----------|
| `kpi-diff-comite-5yr` | Total 5yr Comité − Total 5yr Empresa (nominal) |
| `kpi-diff-comite-5yr-real` | Ídem deflactado por IPC |
| `kpi-diff-sima-5yr` | Total 5yr SIMA − Total 5yr Empresa (nominal) |
| `kpi-diff-sima-5yr-real` | Ídem deflactado |
