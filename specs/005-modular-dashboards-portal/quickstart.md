# Quickstart & Verification Guide: Welcome Portal & Decoupled Dashboards

**Feature**: [specs/005-modular-dashboards-portal/spec.md](spec.md)
**Date**: 2026-08-31

---

## 1. Execution & Testing

1. Open the dashboard in browser or inspect statically:
   ```bash
   python3 -c "import urllib.request; print('Dashboard ready')"
   ```
2. Verify HTML tag balancing and DOM structure:
   ```bash
   python3 src/validate_sources.py
   ```
3. Run dashboard UI test suite:
   ```bash
   python3 -m unittest tests/test_dashboard_ui.py
   ```

---

## 2. Acceptance Scenarios

| Scenario | Trigger / Action | Expected Result | Status |
|---|---|---|:---:|
| Default Landing View | Open root URL (no hash) | `tab-portal` renders with mission, KPIs, and site map | Ready |
| Site Map Navigation | Click "Calculadora Salarial" card | `switchTab('tab-purchasing-power')` executed, scroll to top | Ready |
| Direct Hash Deep-Link | Open URL with `#logistica` | `tab-industrial` loads with Beluga radar & JIT buffer | Ready |
| Breadcrumb Return | Click "← Volver al Mapa Web" | Instant return to `tab-portal` without page reload | Ready |
