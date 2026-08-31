# Bug Assessment: Corregir y dinamizar serie de cotización AIR.PA e hitos bursátiles

- **Slug**: fix-stock-chart-values
- **Created**: 2026-08-31
- **Source**: "estos valores no parecen correctos, validalos y corrigelos, ademas la grafica ha de ser dinámica y actualizada dia a dia" + Image attachment
- **Verdict**: valid
- **Severity**: high

## Report (verbatim or summarized)

User submitted a screenshot of the Airbus SE (`AIR.PA`) stock chart and its accompanying "Cronología Bursátil: Hitos del Conflicto & Reacción de Inversores" panel in Module 1 (`tab-overview` / `#tab-stock`).
User report: *"estos valores no parecen correctos, validalos y corrigelos, ademas la grafica ha de ser dinámica y actualizada dia a dia"*.

## Symptom

1. **Inaccurate Percentage Values**: The milestone cards displayed below the stock chart contain hardcoded percentage badges (`-0,8%`, `-2,9%`, `-2,1%`, `-0,6%`) that do not accurately correspond to either session-over-session deltas ($\Delta_{\text{DoD}}$) or cumulative peak drops ($\Delta_{\text{Peak}}$).
2. **Static HTML Milestone Cards**: The "Cronología Bursátil" list in `dashboard/index.html` is hardcoded as static HTML markup instead of being rendered dynamically from `stock_market_analysis.daily_history_conflict`.
3. **Static Series Horizon**: The stock chart series ends statically on August 28, 2026 (Day 4 of the strike), failing to dynamically extend and reflect ongoing conflict trading days up to the current date and beyond.

## Reproduction

1. Open `dashboard/index.html` and switch to `1. Centro de Mando & Asimetría` (`#tab-stock`).
2. Scroll to `Evolución Diaria de la Cotización AIR.PA (Junio - Agosto 2026) e Hitos del Conflicto`.
3. Inspect the milestone cards under the chart: observe static HTML elements with mismatched percentage figures.
4. Compare chart series in `conflict_metrics.json` against dynamic timeline: notice the series is fixed at 28/08/2026 without dynamic date extension.

## Suspected Code Paths

- `dashboard/index.html:560-596` — Hardcoded static milestone cards in the left stock panel.
- `dashboard/app.js:1072-1158` (`initAirbusStockChart`) — Missing dynamic DOM rendering of milestone cards and missing dynamic daily series extension based on chronology.
- `src/analysis_engine.py:1231-1273` (`get_stock_market_analysis`) — Fixed array of milestone quotes without dynamic calendar extension for ongoing conflict days.
- `data/conflict_metrics.json:21-150` — Stock series dataset requires verification of daily closing prices, daily percentage variations, and cumulative market cap destruction.
- `src/validate_invariants.py:165-290` — Invariant rules for stock pricing and milestone verification.

## Root Cause Hypothesis

The stock chart and its milestone panel were constructed as a hybrid of static HTML cards and a fixed static JSON series ending at August 28, 2026. The percentage values displayed on the milestone badges were manually estimated instead of calculated formulaically ($(\text{price}_t - \text{price}_{t-1})/\text{price}_{t-1}$ or $(\text{price}_t - \text{peak})/\text{peak}$). Furthermore, the rendering function does not dynamically populate the milestone DOM container or extrapolate/extend daily quotes as the strike duration advances.

Confidence: High.

## Proposed Remediation

**Preferred**:
1. **Mathematical Validation & Calibration**: Re-calculate and verify all daily prices, session deltas, and peak-to-date losses in `data/conflict_metrics.json` and `src/analysis_engine.py`.
2. **Dynamic Milestone Generation in `app.js`**: Replace the hardcoded HTML milestone container in `dashboard/index.html` with a dynamic container (`id="stock-milestones-container"`), and dynamically render each milestone badge and percentage delta directly from `stock_market_analysis.daily_history_conflict`.
3. **Dynamic Daily Series Extension**: Update `initAirbusStockChart()` and `getConflictChronology()` to dynamically generate/extend daily tracking quotes for active strike days beyond 28/08/2026 based on the live conflict day count and daily market impact model.
4. **Invariant & Test Updates**: Update `validate_invariants.py` and unit tests in `tests/test_dynamic_metrics.py` to assert mathematical correctness of stock deltas and dynamic milestone DOM generation.

**Files likely to change**:
- `dashboard/index.html`
- `dashboard/app.js`
- `src/analysis_engine.py`
- `data/conflict_metrics.json`
- `tests/test_dynamic_metrics.py`
- `src/validate_invariants.py`

**Tests to add or update**:
- Test in `tests/test_dynamic_metrics.py` validating stock milestone percentage calculation ($(\text{price}_t - \text{price}_{t-1}) / \text{price}_{t-1}$).
- Test in `tests/test_dashboard_ui.py` validating that `#stock-milestones-container` exists and is populated dynamically.

## Risks & Considerations

- Invariant Rule 8 & 12 in `validate_invariants.py` strictly check Euronext Paris price consistency and capitalization loss formulas: changes to base prices must preserve mathematical consistency across `conflict_metrics.json`, `data.js`, and documentation.

## Open Questions

- None. Requirements are clear and verifiable against primary market data formulas.
