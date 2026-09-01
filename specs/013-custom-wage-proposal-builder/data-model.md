# Data Model: Custom Wage Proposal & Multi-Scenario Comparator

**Branch**: `013-custom-wage-proposal-builder` | **Date**: 2026-09-01

## Entities

### CustomProposalParams (Runtime Client State)

| Campo | Tipo | Rango / Valores | Default | Descripción |
|-------|------|-----------------|---------|-------------|
| `initialRaisePct` | float | $0.0 \le x \le 25.0$ | $8.0\%$ | Subida salarial inicial en tablas aplicable en 2026 |
| `arrears` | float | $0 \le x \le 15.000$ | $4.000\text{ \euro}$ | Paga única / atrasos retroactivos en euros |
| `rsgMode` | string | `'none'`, `'ipc_100'`, `'ipc_margin'` | `'ipc_100'` | Modalidad de cláusula de revisión salarial |
| `rsgMargin` | float | $-2.0 \le x \le 4.0$ | $0.0\%$ | Margen porcentual sumado/restado al IPC |
| `rsgCap` | float / null | $1.0 \le x \le 8.0$ o `null` | `null` | Tope máximo anual a la revisión por IPC |
| `recoveryTargetYear` | int | $2026 \le x \le 2030$ | $2030$ | Año objetivo para la meta de recuperación |

---

### ProposalComparisonResult (Derived Object)

```typescript
interface ProposalScenario {
  name: string;
  badge: string;
  initialRaisePct: number;
  salaryY1: number;
  monthlyNetRaise: number;
  realSalaryY5: number;
  realPurchasingPowerChangePct: number;
  arrearsGross: number;
  rsgDescription: string;
  year1NetTotalBenefit: number;
  yearlyNominal: number[]; // [2025, 2026, 2027, 2028, 2029, 2030]
  yearlyReal: number[];    // Deflated by CPI
  total5YearNominal: number;
  total5YearReal: number;
  deltaVsCompanyNominal: number;
  deltaVsCompanyReal: number;
}

interface MultiProposalComparison {
  companyOffer: ProposalScenario;
  committeePlatform: ProposalScenario;
  customProposal: ProposalScenario;
  recoveryTargetCalculations: {
    targetYear: number;
    requiredInitialRaisePct: number;
    cpiAssumedPct: number;
    purchasingPowerGapY5: number;
  };
}
```

---

## Presets Data Definitions

| Preset ID | Nombre | `initialRaisePct` | `arrears` | `rsgMode` | `rsgMargin` | `rsgCap` |
|---|---|---|---|---|---|---|
| `preset-loss-zero` | Pérdida Cero (100% IPC) | IPC actual (ej. 2,5%) | 0 € | `'ipc_100'` | 0,0% | `null` |
| `preset-recovery-2030` | Recuperación 2030 | 10,8% | 5.000 € | `'ipc_margin'` | +1,0% | `null` |
| `preset-equilibrium` | Equilibrio Negociación | 8,0% | 4.000 € | `'ipc_100'` | 0,0% | 3,0% |
