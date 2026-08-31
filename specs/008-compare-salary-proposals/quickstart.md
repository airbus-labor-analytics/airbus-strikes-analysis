# Quickstart Validation Guide: Salary Proposals Comparison

**Feature**: `008-compare-salary-proposals`
**Date**: 2026-08-31
**Status**: Completed

## 1. Automated Verification Scenarios

### Scenario 1: Analytical Model & Invariants Verification
Run the complete automated test suite to ensure the salary proposals model satisfies all mathematical invariants:

```bash
# 1. Validate domain invariants across datasets
python3 src/validate_invariants.py

# 2. Run unit & integration test suite
python3 -m unittest discover tests/
```

**Expected Outcome**:
- `validate_invariants.py`: ALL mathematical, electoral, and financial consistency checks PASS.
- `tests/`: 100% tests pass (zero failures, zero errors).

---

### Scenario 2: Primary Sources & DOM Integrity Check
Verify that all source links and DOM tag balances in `dashboard/index.html` pass validation:

```bash
python3 src/validate_sources.py
```

**Expected Outcome**:
- 100% HTML tags balanced with zero unclosed elements.
- 100% primary source links resolve cleanly.

---

### Scenario 3: Interactive Dashboard UI & Simulation Smoke Test
Launch a local HTTP server and inspect Module 3 (`#tab-purchasing-power`):

```bash
# Launch preview
python3 -m http.server 8080 --directory .
```

**Verification Steps**:
1. Open browser at `http://localhost:8080/dashboard/`.
2. Click on **Módulo 3: Poder Adquisitivo & Negociación** (`#tab-purchasing-power`).
3. Move the **Salario Bruto Actual** slider from `50.000 €` to `65.000 €`.
4. Check that:
   - All 3 proposals (Airbus SE, CGT, Comité de Huelga) update immediately with 0ms visual delay.
   - The multi-line Chart.js canvas (`wagesChart`) renders all 3 proposals + inflation baseline clearly.
   - The **Tabla Comparativa Exhaustiva Punto por Punto** displays all 10 dimensions with dates, authors, and source tags.
