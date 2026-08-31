# Ingestion Engine CLI Contract

**Interface**: `src/data_ingestion.py`  
**Protocol**: Standard POSIX CLI arguments, JSON logging to stdout, exit codes `0` (Success), `1` (Invariant or fatal error).  

## Command Usage

```bash
# Execute a single on-demand ingestion run across all enabled sources
python3 src/data_ingestion.py --run-once

# Execute a single ingestion run for a specific source ID
python3 src/data_ingestion.py --run-once --source telegram_getafe_assembly

# Start the continuous background polling daemon (interval from config/sources.json)
python3 src/data_ingestion.py --daemon

# Start with custom polling interval override (e.g. 10 minutes)
python3 src/data_ingestion.py --daemon --interval 10

# Validate configurations and check source reachability without writing data
python3 src/data_ingestion.py --dry-run
```

## CLI Flags & Options

| Flag | Short | Type | Default | Description |
|---|---|---|---|---|
| `--run-once` | `-1` | Flag | `False` | Run a single ingestion and invariant check cycle, then exit |
| `--daemon` | `-d` | Flag | `False` | Run continuous polling loop at configured intervals |
| `--interval` | `-i` | Integer | From config | Override polling interval in minutes |
| `--source` | `-s` | String | All | Target a specific `DataSource.id` |
| `--config` | `-c` | Path | `config/sources.json` | Path to sources configuration file |
| `--dry-run` | `-n` | Flag | `False` | Ingest and validate without persisting changes to `data/` |
| `--json` | `-j` | Flag | `False` | Emit structured JSON execution logs |

## Output Schema (JSON Mode)

```json
{
  "event_id": "evt_20260831_180000",
  "status": "success",
  "sources_polled": ["telegram_archive", "sima_news", "beluga_status"],
  "sources_updated": ["telegram_archive"],
  "items_ingested": 3,
  "invariants_passed": true,
  "duration_seconds": 0.42
}
```
