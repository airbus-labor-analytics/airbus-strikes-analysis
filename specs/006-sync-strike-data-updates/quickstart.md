# Quickstart & Verification Guide: Strike Data Sync & Validation Gate

**Feature**: [specs/006-sync-strike-data-updates/spec.md](spec.md)
**Date**: 2026-08-31

---

## 1. Prerequisites

- Python 3.10+ installed
- Chromium browser (for headless DOM validation)
- Verified repository datasets in `data/` and Telegram archives in `data/telegram_archive/`

---

## 2. Verification Scenarios

### Scenario A: Interactive User Validation Gate
1. Run data ingestion / synchronization:
   ```bash
   python3 src/data_ingestion.py --run-once --interactive-review
   ```
2. Observe itemized change table:
   - Proposed additions: SIMA 27-August Proposal (7,500€ paga única, 12% subida retroactiva a 1-ene-2026, IPC+1.5% anual).
   - Source citation: `data/telegram_archive/legal_filings/Reuni_n_Comit__de_Huelga_en_el_SIMA_el_27-08-2026__1_.pdf.txt`.
   - Sensitivity level: `PROVISIONAL_NEGOTIATION`.
3. Confirm approval prompt triggers interactive response.

### Scenario B: Sensitive Data Badge on Dashboard
1. Open dashboard in browser:
   ```bash
   python3 -m http.server 8000
   # Open http://localhost:8000/dashboard/index.html
   ```
2. Navigate to "Poder Adquisitivo & Negociación" (or Module 3).
3. Verify that the SIMA 27/08 proposal card displays:
   - Amber badge: `⚠️ Información Sensible en Revisión / Negociación Activa`.
   - Tooltip explaining pending assembly ratification.

### Scenario C: Multi-Surface Invariant Gates
1. Run full invariant suite:
   ```bash
   python3 src/validate_invariants.py
   ```
2. Run source & DOM hierarchy validator:
   ```bash
   python3 src/validate_sources.py
   ```
3. Run comprehensive unit tests:
   ```bash
   python3 -m unittest discover tests
   ```
4. Verify 100% PASS with zero warnings or errors.
