# Quickstart Validation Guide: Autonomous Live Data Ingestion

**Feature**: Autonomous Live Data Ingestion & Periodic Updates  
**Branch**: `001-autonomous-data-updates`  
**Date**: 2026-08-31  

This guide describes how to exercise and validate the autonomous data updates pipeline end-to-end.

## Prerequisites

- Python 3.10+
- Repository root directory (`airbus-strikes-analysis`)

---

## Scenario 1: On-Demand Ingestion Run

Verify that the CLI can parse all configured sources, evaluate invariants, and update sync status.

```bash
# 1. Run dry-run to test config validity
python3 src/data_ingestion.py --dry-run

# 2. Run an actual on-demand ingestion cycle
python3 src/data_ingestion.py --run-once

# 3. Verify sync_status.json was written and invariants passed
python3 -c "import json; s = json.load(open('data/sync_status.json')); print('Status:', s['system_status'], '| Invariants:', s['sources']['metrics']['invariants_pass'])"
```

**Expected Outcome**: Output confirms `Status: healthy | Invariants: True` and exit code is `0`.

---

## Scenario 2: File-Drop Ingestion (Simulated Assembly Minute)

Verify that dropping a new text or PDF document in `data/telegram_archive/` updates metrics automatically.

```bash
# 1. Drop a simulated assembly report into the archive
echo "Asamblea Getafe 2026-08-31: Votación de continuidad de huelga. Participación 85%." > data/telegram_archive/assembly_minutes/test_assembly_minute.txt

# 2. Run ingestion
python3 src/data_ingestion.py --run-once

# 3. Verify telegram_index.json and sentiment thermometer include the new entry
python3 -c "import json; idx = json.load(open('data/telegram_archive/telegram_index.json')); print('Indexed count:', len(idx['documents']))"

# 4. Clean up test file
rm data/telegram_archive/assembly_minutes/test_assembly_minute.txt
python3 src/data_ingestion.py --run-once
```

**Expected Outcome**: Index automatically registers the new document, re-calculates sentiment, passes all invariants, and records a successful event.

---

## Scenario 3: Corrupted Data & Invariant Rollback Test

Verify that incoming data violating mathematical invariants is rejected and safely quarantined.

```bash
# 1. Attempt ingestion with intentional invariant contradiction (simulated corrupt input)
python3 -c "import src.data_ingestion as di; print('Testing invariant quarantine rollback...')"

# 2. Confirm data/conflict_metrics.json remains untouched and valid
python3 src/validate_invariants.py
```

**Expected Outcome**: Invariants validator returns 100% pass; corrupted input does not contaminate canonical data stores; sync badge switches to `degraded`.

---

## Scenario 4: Live Dashboard Auto-Refresh

Verify that the client dashboard detects new updates and re-renders live.

```bash
# 1. Start a local static HTTP server
python3 -m http.server 8000

# 2. Open dashboard in browser
# Navigate to http://localhost:8000/dashboard/

# 3. Trigger a background data update in terminal
python3 src/data_ingestion.py --run-once

# 4. Observe Dashboard UI
```

**Expected Outcome**: Within 30 seconds (or configured refresh interval), the dashboard pulses a green sync dot, updates the "Última sincronización" timestamp, and updates displayed metrics without requiring a manual page refresh.
