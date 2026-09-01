# Quickstart: Salary Simulator Redesign Validation

**Branch**: `012-salary-simulator-redesign` | **Date**: 2026-09-01

## Prerequisites
- Python 3.10+
- Browser with JavaScript enabled or headless browser runner

## Verification Scenarios

### 1. Invariants & Source Integrity
```bash
python3 src/validate_invariants.py
python3 src/validate_sources.py
python -m unittest discover tests/
```
Expected: All tests pass (0 failures, 100% tags balanced).

### 2. Interactive Browser Smoke Test
1. Open `dashboard/index.html` in browser.
2. Navigate to **Tab 3: Poder Adquisitivo & Negociación** (`#tab-purchasing-power`).
3. Verify that the 3 proposal cards display clearly without redundant tables below them.
4. Hover over any KPI label (e.g. "Subida neta/mes", "Poder compra real Año 5") and verify that the math formula tooltip appears with exact algebra and explanation.
5. Change Gross Annual Salary to `60.000 €` and IPC to `3,8%`.
6. Verify that:
   - All 3 cards immediately update with the new figures.
   - The `#salaryEvolutionChart` updates showing the diverging trajectories across 2025–2030.
   - The ROI of the strike recalculates correctly.
