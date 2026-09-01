# Contract: Beluga Recent Movements Telemetry API

**Feature**: `015-beluga-last-movements`  
**Contract ID**: `beluga-movements-api-v1`  
**Status**: Active  

---

## 1. Python Module API (`src/beluga_tracker.py`)

### Method: `BelugaTracker.fetch_live_data() -> Dict[str, Any]`
Fetches and formats real-time Beluga logistics status, returning a dictionary containing `recent_movements: List[Dict[str, Any]]`.

### Method: `BelugaTracker.get_recent_movements(raw_aircraft: Optional[List[Dict[str, Any]]] = None) -> List[Dict[str, Any]]`
Generates/processes the list of recent flight legs.

### CLI Contract
```bash
python3 src/beluga_tracker.py --update
python3 src/beluga_tracker.py --json
```

---

## 2. JSON Schema Invariant

`data/beluga_status.json` must validate against `BelugaFleetStatus` schema with a non-empty `recent_movements` list containing valid flight leg objects.
