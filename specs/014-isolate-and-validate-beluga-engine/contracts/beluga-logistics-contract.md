# Contract: Beluga Logistics Engine & Standalone API

**Feature**: `014-isolate-and-validate-beluga-engine`  
**Contract ID**: `beluga-logistics-v2`  
**Status**: Active  

---

## 1. Python Module Interface (`src/beluga_tracker.py`)

### Class: `BelugaTracker`

```python
class BelugaTracker:
    def __init__(self, api_url: str = "https://beluga.simcoe.co.uk/api/belugas.php"):
        """Initializes tracker with target ADS-B radar endpoint."""
        ...

    def fetch_live_data(self) -> Dict[str, Any]:
        """
        Fetches live JSON data from BelugaWatch API and parses fleet positions.
        Falls back to get_calibrated_fallback_status() on network failure or rate limit.
        Returns: BelugaFleetStatus dictionary adhering to data-model.md schema.
        """
        ...

    def analyze_fleet_status(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes raw aircraft positions and categorizes fleet into:
        - Getafe connected flights (LEGT)
        - European airborne flights
        - Grounded aircraft
        - European route disruption matrix
        """
        ...

    def get_calibrated_fallback_status(self) -> Dict[str, Any]:
        """
        Provides deterministic fallback status for offline testing and API outages.
        Guarantees 100% schema compliance with zero external network requests.
        """
        ...
```

---

## 2. CLI Interface

The module MUST be executable directly from the command line:

```bash
# Fetch and print JSON to stdout
python3 src/beluga_tracker.py --json

# Fetch and update data/beluga_status.json
python3 src/beluga_tracker.py --update
```

**Exit Codes**:
- `0`: Success (live fetch or calibrated fallback successfully generated).
- `1`: Unhandled error / filesystem permission failure.

---

## 3. Data File Artifact Contract (`data/beluga_status.json`)

- **Format**: Pretty-printed JSON (indent=2, UTF-8, `ensure_ascii=False`).
- **Location**: `data/beluga_status.json`.
- **Invariants**: Must validate against `BelugaFleetStatus` schema in `data-model.md`.
