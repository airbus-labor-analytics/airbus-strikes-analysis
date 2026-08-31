# Audit & Verification CLI Contract

**Feature Branch**: `002-verify-stock-data`  
**Date**: 2026-08-31  

---

## 1. CLI Audit Interface

The validation pipeline enforces zero data corruption and 100% primary source grounding via two CLI tools:

### 1.1 Invariant Validator (`src/validate_invariants.py`)

```bash
python3 src/validate_invariants.py [--json] [--strict]
```

- **Exit Code 0**: 100% of mathematical rules (1 through 14) pass.
- **Exit Code 1**: At least one invariant failed or a data discrepancy was detected.

### 1.2 Primary Source Validator (`src/validate_sources.py`)

```bash
python3 src/validate_sources.py [--check-urls]
```

- **Exit Code 0**: 100% of sections, tables, benchmarks, and metrics are substantiated by valid primary source links.
- **Exit Code 1**: Missing, broken, or unverified source links found.

---

## 2. Zero-Unverified-Data Invariant Gate

Before any commit or data update, the following pipeline MUST succeed:

```bash
python3 src/validate_invariants.py && python3 src/validate_sources.py && python3 -m unittest discover tests
```
