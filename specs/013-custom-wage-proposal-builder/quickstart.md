# Quickstart: Custom Wage Proposal Builder Validation

**Branch**: `013-custom-wage-proposal-builder` | **Date**: 2026-09-01

## Prerequisites
- Python 3.10+
- Browser with JavaScript enabled (or headless Chromium runner)

## Verification Scenarios

### 1. Invariants & Source Integrity
```bash
python3 src/validate_invariants.py
python3 src/validate_sources.py
python -m unittest discover tests/ -v
```

### 2. Interactive Browser Verification
1. Open `dashboard/index.html` in browser.
2. Navigate to `#tab-purchasing-power`.
3. Verify that the 3 cards displayed are:
   - **1. Oferta Patronal Airbus (+5,0%)**
   - **2. Plataforma del Comité (+12,0%)**
   - **3. Tu Propuesta Personalizada** (with in-card controls)
4. Click on Preset **"Pérdida Cero (100% IPC)"**:
   - Verify that the initial raise adjusts to current IPC (e.g. 2,5%), RSG becomes 100% IPC, and 5-year real loss becomes 0.0% (100% IPC).
5. Click on Preset **"Equilibrio Negociación"**:
   - Verify initial raise adjusts to 8,0%, arrears to 4.000 €, RSG cap to 3,0%.
6. Adjust custom raise slider to **10,0%**:
   - Card 3 immediately recalculates ($S_1 = 55.000\text{ \euro}$ for 50k base).
   - `#salaryEvolutionChart` and `#wagesChart` update the custom proposal curve in real time.
   - `#kpi-diff-custom-5yr` displays positive differential vs. Company offer.
