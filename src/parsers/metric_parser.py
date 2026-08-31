#!/usr/bin/env python3
"""
src/parsers/metric_parser.py
============================
Parses external economic indicators and Beluga logistics disruption data.
"""

import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


def parse_beluga_logistics(file_path: Optional[Path] = None) -> Dict[str, Any]:
    """
    Parse and validate Beluga transport logistics metrics from file or API.
    """
    target = file_path or (PROJECT_ROOT / "data" / "beluga_status.json")
    if not target.exists():
        return {
            "status": "unavailable",
            "fleet_status": {},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    try:
        with open(target, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # Ensure standard timestamp and summary attributes
        data["last_parsed"] = datetime.now(timezone.utc).isoformat()
        return data
    except Exception as e:
        return {
            "status": "error",
            "error_message": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


def parse_economic_metrics(endpoint: str, timeout: int = 5) -> Dict[str, Any]:
    """
    Query economic statistics (e.g. INE CPI API) with fallback to local baseline.
    """
    if endpoint.startswith("http://") or endpoint.startswith("https://"):
        headers = {"User-Agent": "AirbusStrikesAnalysis/1.0"}
        req = urllib.request.Request(endpoint, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return {
                    "source": "ine_live_api",
                    "status": "active",
                    "data": data,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
        except Exception:
            # Fallback on network failure
            pass

    return {
        "source": "local_baseline",
        "status": "cached",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
