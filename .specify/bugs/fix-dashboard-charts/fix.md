# Bug Fix: Fix Dashboard Charts Rendering and Interface Structural Issues

- **Slug**: fix-dashboard-charts
- **Fixed**: 2026-08-31
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Repaired HTML DOM hierarchy and tag balancing in `dashboard/index.html` across Module 3 (`tab-purchasing-power`) where premature closing tags corrupted sibling module bounds and constrained `wagesChart`. Added automatic view scroll reset (`mainContainer.scrollTop = 0`), active chart `.resize()` triggers, and backward-compatible hash alias resolution in `dashboard/app.js`.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `dashboard/index.html` | modified | Balanced DOM tags across `tab-purchasing-power`: removed premature closing tags, closed `lg:col-span-2` after the table, restored `#detailed-offers-accordion-container` parent bounds, and allowed `wagesChart` to span full width (929px). |
| `dashboard/app.js` | modified | Enhanced `switchTab()` to automatically reset main scroll container to top (`scrollTop = 0`), trigger `resize()` on visible Chart.js instances, and handle deep-linking hash aliases seamlessly. |

## Diff Highlights

### `dashboard/index.html`
```html
<!-- Table container properly closed before ROI card -->
                  </tbody>
                </table>
              </div>
            </div>

<!-- wagesChart card rendered cleanly in full width -->
            <div class="h-64 sm:h-72 w-full mt-2">
              <canvas id="wagesChart"></canvas>
            </div>
          </div>
        </div>
```

### `dashboard/app.js`
```javascript
  // Always reset scroll position of the main view to the top on tab change
  const mainContainer = document.querySelector('main');
  if (mainContainer) {
    mainContainer.scrollTop = 0;
  }
  
  // Ensure all active Chart.js instances perform a clean resize
  const activeCanvases = activeTab ? activeTab.querySelectorAll('canvas') : [];
  activeCanvases.forEach(canvas => {
    const chartInstance = Chart.getChart(canvas);
    if (chartInstance && typeof chartInstance.resize === 'function') {
      chartInstance.resize();
    }
  });
```

## Local Verification

- **Headless Browser Automated Inspection**:
  - All 5 tabs (`tab-overview`, `tab-industrial`, `tab-purchasing-power`, `tab-union-force`, `tab-evidence`) tested via Puppeteer.
  - All 12 Chart.js canvases verified with positive dimensions, `visible: true`, and `hasChartInstance: true`.
  - All 16 backward-compatible URL hash aliases verified (100% pass).
  - Scroll reset on tab navigation verified (`scrollTop: 0`).
- **Data Invariant Engine**: `python3 src/validate_invariants.py` → 14/14 rules PASSED.
- **Data Veracity Audit**: `python3 src/audit_data_veracity.py` → 100% metrics verified.
- **Source Validator**: `python3 src/validate_sources.py` → 5 tabs, 12 Chart.js canvases, 57 primary links verified.
- **Test Suite**: `python3 -m unittest discover tests` → 18/18 tests PASSED.

## Deviations from Assessment

None. The remediation directly resolved the defects diagnosed in the assessment.

## Follow-ups

- Run `/speckit.bug.test slug=fix-dashboard-charts` to lock in the automated tests and regression checks.
