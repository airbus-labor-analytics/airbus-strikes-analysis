# Bug Fix: Custom Proposal Builder Reactivity, Keyboard Inputs & Transparent Formulas

- **Slug**: fix-proposal-builder-inputs-charts
- **Fixed**: 2026-09-01
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Replaced rigid dropdowns with keyboard-writable numeric inputs paired with range sliders for initial raise percentage and retroactive arrears in Card 3, added explicit IPC linkage and margin toggles with a configurable hyperinflation cap, and added transparent mathematical formula tooltips (`.math-tip`) detailing algebraic breakdowns across Company, Committee, and Custom scenarios.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `dashboard/index.html` | modified | Added dual keyboard `<input type="number">` controls for initial raise ($S_1$) and arrears (€), quick chips, RSG margin/IPC linkage toggle, hyperinflation cap input, and algebraic math tooltips across Cards 1, 2, and 3. |
| `dashboard/app.js` | modified | Enhanced `getCustomProposalState()`, `updateCustomRaise()`, `setCustomArrearsQuick()`, `onRsgModeSelectChange()`, `onCapToggleChange()`, and `setCustomProposalPreset()` with full bidirectional keyboard/slider synchronization and reactivity. |
| `tests/test_dashboard_ui.py` | modified | Updated `test_custom_proposal_builder_controls_and_logic` to test numeric keyboard input IDs, IPC linkage, RSG margin, cap controls, and handler functions. |

## Diff Highlights (optional)

```javascript
// Bidirectional keyboard/slider synchronization
function updateCustomRaise(val, source = 'slider') {
  const slider = document.getElementById('sim-custom-raise');
  const raiseInput = document.getElementById('sim-custom-raise-input');
  const badge = document.getElementById('sim-custom-raise-badge');

  const numVal = parseFloat(val) || 0;
  if (source === 'slider' && raiseInput) {
    raiseInput.value = numVal.toFixed(1);
  } else if (source === 'input' && slider) {
    slider.value = numVal;
  }
  if (badge) badge.textContent = `${numVal.toFixed(1).replace('.', ',')}%`;
  updateWageSimulation();
}
```

## Tests Added or Updated

- `tests/test_dashboard_ui.py::TestDashboardUI::test_custom_proposal_builder_controls_and_logic` - Pins down in-card keyboard numeric inputs, IPC linkage checkboxes, RSG margin inputs, cap controls, and helper functions in `app.js`.

## Local Verification

- Commands run: `node -c dashboard/app.js && node -c dashboard/data.js && python3 src/validate_invariants.py && python3 -m unittest discover -s tests` -> PASS (56 unit and UI tests, 100% invariants valid, 0 HTML syntax errors).

## Deviations from Assessment

None.

## Follow-ups

- Run `/speckit.bug.test slug=fix-proposal-builder-inputs-charts` to generate regression tests and validate verification gates.
