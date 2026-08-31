# UI Contract: Wage Proposals & Multi-Proposal Comparison Interface

**Feature**: `008-compare-salary-proposals`
**Date**: 2026-08-31
**Status**: Completed

## 1. DOM Elements & IDs

| Element ID | Tag | Function | Expected Behavior |
|---|---|---|---|
| `wage-calculator-section` | `div` | Main Module 3 simulator wrapper | Contains all input controls, summary cards, and charts |
| `salary-proposals-matrix-table` | `table` | Point-by-point comparative matrix | Renders the 10 bargaining dimensions across Company, CGT, and Strike Committee |
| `proposal-cards-container` | `div` | 3 proposal summary header cards | Displays proposal titles, dates, authors, and initial increases |
| `wagesChart` | `canvas` | Multi-line 5-year trajectory chart | Visualizes all 3 proposals + real CPI baseline |
| `tb-prop-cgt-nom` | `td` / `span` | CGT Year 5 nominal salary | Reactive to salary slider |
| `tb-prop-cgt-real` | `td` / `span` | CGT Year 5 real deflated salary | Reactive to salary and inflation sliders |
| `tb-prop-comite-nom` | `td` / `span` | Strike Committee Year 5 nominal salary | Reactive to salary slider |
| `tb-prop-co-nom` | `td` / `span` | Airbus SE Year 5 nominal salary | Reactive to salary slider |

## 2. JavaScript Interface Functions

```javascript
/**
 * Computes 5-year gross salary projections for Company, CGT, and Strike Committee proposals.
 * @param {number} baseSalary - Gross annual salary in 2025 (€)
 * @param {number} ipcRate - Expected annual inflation rate (decimal, e.g. 0.025)
 * @returns {Object} Structured projections matching SalaryProposalsComparisonSchema
 */
function calculateSalaryProposals(baseSalary, ipcRate) {
  // Returns { company, cgt, strike_committee } with yearly arrays and totals
}

/**
 * Initializes and updates the point-by-point proposal matrix table in Module 3.
 * @param {Array} comparisonMatrix - Array of BargainingDimension objects
 */
function renderSalaryProposalsMatrix(comparisonMatrix) {
  // Dynamically injects rows into #salary-proposals-matrix-table
}
```
