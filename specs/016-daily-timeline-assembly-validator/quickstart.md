# Quickstart & Validation Guide: Daily Timeline Freshness Validator

**Feature**: `016-daily-timeline-assembly-validator` | **Date**: 2026-09-01

## 1. Prerequisites
- Python 3.11+
- Node.js 18+ (for DOM / JS syntax validation)
- Dataset files located in `data/conflict_metrics.json` and `data/telegram_archive/`

---

## 2. Command Line Validation Scenarios

### Scenario A: Run the Dedicated Timeline Freshness Validator
```bash
python3 src/validate_timeline_freshness.py
```
**Expected Output**:
- Displays current Madrid date vs latest timeline milestone date.
- Evaluates freshness status (`UP_TO_DATE` or `PENDING_TODAY`).
- Validates chronological monotonicity and schema conformance across all timeline milestones.

### Scenario B: Run Full Invariant Suite with Rule 15 Check
```bash
python3 src/validate_invariants.py
```
**Expected Output**:
- All 15 mathematical, chronological, and census rules pass `[PASS]`.
- Exit code `0`.

### Scenario C: Run Targeted Unit Tests
```bash
python3 -m unittest tests/test_timeline_freshness.py
```
**Expected Output**:
- All unit tests covering date parsing, timezone evaluation, freshness threshold logic, and Telegram document cross-linking pass `OK`.

---

## 3. UI Smoke Test & Verification

1. Launch local static server:
```bash
python3 -m http.server 8000 --directory dashboard
```
2. Open browser at `http://localhost:8000/#sec-unions-timeline`.
3. Verify:
   - **Freshness Banner**: Renders at the top of the timeline section.
   - **Action Links**: If pending today, clicking the Telegram or News feed links navigates directly to the relevant document viewer or modal.
   - **Chronology & Filters**: Milestones from July 2026 up to today (September 1, 2026) are visible, searchable, and filterable by plant (`Getafe`, `Illescas`, `San Pablo`, etc.) and actor (`Asamblea`, `SIMA`, `SIPA`, `CCOO`, `UGT`, `CGT`).
   - **Minutes Modal**: Clicking on any assembly minute entry opens the document modal displaying the source transcript from `data/telegram_archive/assembly_minutes/`.
