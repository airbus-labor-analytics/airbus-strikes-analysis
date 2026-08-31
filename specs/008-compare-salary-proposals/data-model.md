# Data Model: Salary Proposals & Gross Annual Wage Evolution

**Feature**: `008-compare-salary-proposals`
**Date**: 2026-08-31
**Status**: Completed

## 1. Entities & Schemas

### 1.1 WageProposal Entity
Represents an official or assembly-ratified bargaining proposal.

| Field | Type | Description | Example |
|---|---|---|---|
| `id` | `string` | Unique identifier | `"proposal-cgt-2026"` |
| `name` | `string` | Human-readable title | `"Plataforma CGT (Asamblearia)"` |
| `proposer` | `string` | Organization or body | `"CGT Metal / Asambleas"` |
| `date_presented` | `string` | Official submission date | `"Agosto 2026"` |
| `status` | `string` | Procedural status | `"Vigente en Asambleas"` |
| `source_ref` | `string` | Primary source document | `"https://cgt.es/"` |
| `initial_increase_pct` | `float` | Year 1 consolidated increase | `14.0` |
| `consolidation_date` | `string` | Effective consolidation date | `"01/01/2026"` |
| `arrears_lump_sum_eur` | `float` | One-time retroactive payout | `8500.0` |
| `rsg_formula` | `string` | Annual revision clause | `"IPC Real + 2.0%"` |
| `rsg_cap_pct` | `float | null` | Annual inflation ceiling | `null` |
| `duration_years` | `int` | Agreement duration | `2` |
| `non_wage_clauses` | `Record<string, string>` | Key non-salary stipulations | `{ "bradford": "Nulidad radical", ... }` |

---

### 1.2 AnnualWageProjection Entity
Represents the year-by-year gross annual wage projection (2025–2030) for a given baseline salary.

| Field | Type | Description |
|---|---|---|
| `proposal_id` | `string` | Associated proposal ID |
| `base_salary_y0` | `float` | Base gross annual salary in 2025 (€) |
| `yearly_nominal_wages` | `List[float]` | 6-element array `[Y0, Y1, Y2, Y3, Y4, Y5]` in nominal € |
| `yearly_real_wages` | `List[float]` | 6-element array `[Y0, Y1, Y2, Y3, Y4, Y5]` in real deflated € |
| `yearly_cumulative_nominal` | `List[float]` | Cumulative sum across 5 years in nominal € |
| `yearly_cumulative_real` | `List[float]` | Cumulative sum across 5 years in real € |
| `total_5yr_nominal_earnings` | `float` | Sum of nominal earnings over 5 years (€) |
| `total_5yr_real_earnings` | `float` | Sum of real deflated earnings over 5 years (€) |
| `differential_vs_company_nominal` | `float` | Nominal delta vs. Airbus SE offer (€) |
| `differential_vs_company_real` | `float` | Real delta vs. Airbus SE offer (€) |

---

### 1.3 BargainingDimension Entity
Represents a structured comparison dimension in the Point-by-Point Matrix.

| Field | Type | Description |
|---|---|---|
| `dimension_id` | `string` | Unique dimension identifier (e.g. `"dim-wages"`, `"dim-bradford"`) |
| `topic` | `string` | Category heading |
| `category` | `string` | Domain group (`"Salarial"`, `"Legal & Salud"`, `"Empleo"`, `"Organización"`) |
| `company_offer` | `string` | Airbus SE position |
| `cgt_offer` | `string` | CGT position |
| `strike_committee_offer` | `string` | Strike Committee 11-points position |
| `key_difference` | `string` | Concise gap summary |
| `source_citation` | `string` | Primary source reference |

---

## 2. Invariants & Validation Rules

1. **Conservation Invariant**: For any given baseline $W_0$ and inflation rate $i$:
   $$\forall P: W_{0, P} = W_0$$
2. **Monotonicity**: Under non-negative inflation ($i \ge 0$), nominal wages for CGT and Strike Committee must be strictly monotonic non-decreasing ($W_{y+1, P} \ge W_{y, P}$ for $y \ge 1$).
3. **Array Dimensions**: All yearly wage series must contain exactly 6 elements (Year 0 through Year 5).
4. **Primary Source Integrity**: Every proposal must have an explicit non-null `date_presented` and valid `source_ref`.
