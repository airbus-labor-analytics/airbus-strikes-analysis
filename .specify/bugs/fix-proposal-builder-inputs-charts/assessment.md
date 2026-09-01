# Bug Assessment: Custom Proposal Builder Reactivity, Keyboard Inputs & Transparent Formulas

- **Slug**: fix-proposal-builder-inputs-charts
- **Created**: 2026-09-01
- **Source**: pasted text
- **Verdict**: valid
- **Severity**: high

## Report (verbatim or summarized)

```text
cuando modifico el constructor, las graficas y otros numeros no aparecen, ademas el cosntructor deberia tener valores no hardcodeados, deberian ser escribibles por teclado los numeros y añadir y quitar linkado a ipc, tope o no en caso de sobreinflaccion, etc. siempre añadir info que se muestre la matematica detras de los calculos de cada cosa, tambien en las ofertas de la empresa
```

## Symptom

When interacting with the custom proposal builder controls in Card 3 (`#sc3-custom`), chart curves and derived numerical figures can fail to update reactively or display accurately. Furthermore:
1. Inputs are restricted to fixed dropdown steps / hardcoded presets rather than allowing arbitrary keyboard numeric input (e.g. typing exact initial percentage raise $S_1$, arbitrary retroactive arrears in €, custom RSG margins $\Delta\%$, or custom inflation caps).
2. Users cannot toggle inflation linking on/off or configure hyperinflation caps freely with custom numeric boundaries.
3. Mathematical formulas and explanatory tooltips detailing the underlying algebra behind calculations are missing or incomplete across company offers, committee platform, and custom scenarios.

## Reproduction

1. Navigate to the Salary Simulator tab (`#tab-purchasing-power`).
2. In Card 3 (*Constructor Personalizado*), attempt to type a custom initial increase percentage (e.g., `9.7%`) or an arbitrary arrears amount (e.g., `6.250 €`). Notice only a discrete range slider and a restricted dropdown exist without direct keyboard entry.
3. Change slider and dropdown selections in rapid succession; observe if Chart.js line series (`#salaryEvolutionChart` and `#wagesChart`) or differential KPI cards fail to refresh immediately due to decoupled state synchronization.
4. Inspect math tooltips (`.math-tip`) across Card 1 (Company Offer), Card 2 (Committee Platform), and Card 3 (Custom Proposal) and note gaps in mathematical transparency for April Effect deductions, inflation decay, compounding formulas, and cap cutoffs.

## Suspected Code Paths

- `dashboard/index.html:1465-1510` — Card 3 control markup currently using rigid `<select>` dropdowns instead of dual slider + numeric input fields (`<input type="number">`).
- `dashboard/index.html:1305-1445` — Tooltip containers (`.math-tip`, `.tip-box`) in Card 1 (Company Offer) and Card 2 (Committee Platform) lacking detailed algebraic derivations.
- `dashboard/app.js:971-1026` — `getCustomProposalState()`, `updateCustomRaise()`, `setCustomProposalPreset()` relying on discrete element parsing rather than bidirectional input synchronization.
- `dashboard/app.js:1620-1665` & `1770-1810` — `updateSalaryEvolutionChart()` and `updateWagesChart()` dataset rendering and reactive update calls.

## Root Cause Hypothesis

The custom proposal builder was initially structured with discrete HTML select elements and range sliders without bidirectional `<input type="number">` pairs. When values are modified, state lookup in `getCustomProposalState()` parses element values that may fall out of sync with chart datasets or preset buttons. Additionally, formula documentation tooltips were only partially implemented for the new custom proposal without full mathematical transparency across all 3 comparison scenarios (Company 5% April Effect loss, Committee 12% compounding, and Custom user parameters). Confidence: **High**.

## Proposed Remediation

**Preferred**:
1. **Bidirectional Keyboard & Slider Controls**: Replace rigid dropdowns with paired `<input type="range">` and `<input type="number">` controls for initial raise ($S_1\%$) and arrears (€), allowing both slider dragging and direct keyboard typing with instant two-way synchronization.
2. **Dynamic RSG & Cap Configuration**: Add a toggle checkbox for IPC linkage (`[x] Linkado a IPC`), a numeric input for RSG margin ($\pm\Delta\%$), and a customizable inflation cap input (`Cap anual máx %` with an enable/disable toggle for hyperinflation scenarios).
3. **Comprehensive Mathematical Tooltips**: Enhance all `.math-tip` / `.tip-box` tooltips across Card 1 (Company Offer), Card 2 (Committee Platform), Card 3 (Custom Proposal), and differential KPI cards with explicit LaTeX/monospace algebraic formulas showing step-by-step math (April effect deduction, compounding factor $(1+r)^t$, deflator $(1+i)^t$, and net tax adjustments).
4. **Resilient Reactive Pipeline**: Unify `updateCustomProposal()` to trigger immediate chart dataset updates and metric recalculation ($<16\text{ ms}$).

**Alternatives**:
- *Modal / Drawer Configurator*: Move custom controls to an expandable drawer. *Trade-off*: Slower UX compared to in-card instant controls.

**Files likely to change**:
- `dashboard/index.html`
- `dashboard/app.js`
- `src/analysis_engine.py`
- `tests/test_dashboard_ui.py`

**Tests to add or update**:
- Test numeric keyboard typing synchronization (`sim-custom-raise-input`, `sim-custom-arrears-input`).
- Test IPC linkage toggle and custom cap evaluation.
- Test that all scenario cards contain comprehensive math formula tooltips.

## Risks & Considerations

- Ensure mobile viewports remain compact and do not cause layout overflow with paired number/slider inputs.
- Keep execution latency under 20ms during rapid keyboard keystrokes.

## Open Questions

- None. Requirements are clear and grounded in the codebase.
