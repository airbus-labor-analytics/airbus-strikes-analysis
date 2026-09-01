# Research & Technical Decisions: Beluga Fleet Recent Movements Log

**Feature**: `015-beluga-last-movements`  
**Date**: 2026-09-01  
**Status**: Complete  

---

## 1. Flight Movement Data Extraction & Schema Integration

### Decision
Extract and standardize recent flight legs directly within `src/beluga_tracker.py` under the `recent_movements` key of `data/beluga_status.json`. For live network feeds from BelugaWatch (`https://beluga.simcoe.co.uk/api/belugas.php`), synthesize active flight legs from airborne aircraft coordinates (`routeFrom` ➔ `routeTo`) and retain timestamped operational history. For offline mode, provide verified calibrated flight legs representing the recent operational state across the European network and the Getafe embargo.

### Rationale
- Keeps `data/beluga_status.json` as the single authoritative source of truth for all Beluga logistics telemetry.
- Ensures zero latency on the client side since all movement data is delivered in the bundled or polled JSON payload.
- Adheres strictly to Principle I (*Zero Unverified Data*): no fake mathematical time-series curves; only real, timestamped flight legs.

### Alternatives Considered
- *Polling a secondary flight radar API directly from the client*: Rejected due to CORS restrictions, rate limits, and fragile external client dependencies.
- *Reintroducing weekly aggregate bar charts*: Rejected as unnecessary and violating the constitutional requirement for zero synthetic arrays.

---

## 2. DOM Placement & Visual Hierarchy in `#tab-industrial`

### Decision
Render the recent movements log in a dedicated glass card container `#sec-industrial-movements` placed immediately below the European Corridors Matrix (`#sec-industrial-routes`) in Module 2 (`#tab-industrial`).

### Rationale
- Creates a natural top-down narrative:
  1. Executive Summary & KPIs (Autonomy < 48-72h, Getafe 100% blocked).
  2. HTP Component Retention & Bottleneck.
  3. Individual Fleet State (6 aircraft cards).
  4. European Corridors & Disruption Matrix + Document Citations.
  5. **Recent Flight Movements Log** (Individual verified flight legs).
  6. Media & Public Sentiment Feed.

---

## 3. Client Reactivity & Tail Filter Synchronization

### Decision
Modify `setBelugaTailFilter(tail)` in `dashboard/app.js` to synchronously re-filter both `#beluga-fleet-grid` (aircraft cards) and `#beluga-movements-container` (recent flight legs) without triggering unnecessary network fetches or full DOM re-renders.

### Rationale
- Clicking a tail button (e.g. `XL3 (F-GXLI)`) immediately highlights both the aircraft's current telemetry card and its specific flight leg history.
- Clicking `ALL` restores the full chronological multi-aircraft view seamlessly in $<5\text{ ms}$.

---

## 4. Verification & Validation Strategy

1. **Backend Unit Tests** (`tests/test_beluga_tracker.py`):
   - Assert `recent_movements` schema conformity.
   - Verify presence of 6 BelugaXL registrations.
   - Verify sorting (descending chronological order).
2. **Dashboard UI Integration Tests** (`tests/test_dashboard_ui.py`):
   - Assert `#sec-industrial-movements` and `#beluga-movements-container` exist in `index.html`.
   - Assert `renderBelugaMovements()` and filter synchronization exist in `app.js`.
   - Validate 100% HTML tag balance.
3. **Invariants Check** (`python3 src/validate_invariants.py`):
   - Assert zero regression across all 14 mathematical rules.
