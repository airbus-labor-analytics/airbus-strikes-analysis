#!/usr/bin/env python3
"""
src/parsers/config_loader.py
============================
Loads and validates data sources configuration with environment variable overrides.
"""

import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DEFAULT_CONFIG_PATH = PROJECT_ROOT / "config" / "sources.json"


class ConfigError(Exception):
    """Raised when configuration is missing or invalid."""
    pass


def load_sources_config(config_path: Optional[Path] = None) -> Dict[str, Any]:
    """
    Load data sources configuration from file, applying environment variable overrides.
    """
    target_path = config_path or Path(os.environ.get("SOURCES_CONFIG_PATH", str(DEFAULT_CONFIG_PATH)))
    
    if not target_path.exists():
        raise ConfigError(f"Sources configuration file not found at: {target_path}")

    try:
        with open(target_path, "r", encoding="utf-8") as f:
            config = json.load(f)
    except Exception as e:
        raise ConfigError(f"Failed to parse JSON config at {target_path}: {e}")

    # Validate essential schema requirements
    if "sources" not in config or not isinstance(config["sources"], list):
        raise ConfigError("Config missing required 'sources' array.")

    # Apply global interval override if present in environment
    if "POLLING_INTERVAL_MINUTES" in os.environ:
        try:
            config["default_polling_interval_minutes"] = int(os.environ["POLLING_INTERVAL_MINUTES"])
        except ValueError:
            pass

    # Process and sanitize each source entry
    for src in config["sources"]:
        src_id = src.get("id", "")
        # Check source-specific enabled override: e.g. ENABLE_SOURCE_TELEGRAM_LIVE=true
        env_enable_key = f"ENABLE_SOURCE_{src_id.upper()}"
        if env_enable_key in os.environ:
            config_val = os.environ[env_enable_key].strip().lower()
            src["enabled"] = config_val in ("1", "true", "yes", "on")

        # Resolve credentials if auth_env_var is specified
        auth_var = src.get("auth_env_var")
        if auth_var and auth_var in os.environ and os.environ[auth_var]:
            src["auth_token"] = os.environ[auth_var]
        else:
            src["auth_token"] = None

    return config


def get_source_by_id(source_id: str, config: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    """Retrieve a specific source configuration by its ID."""
    cfg = config or load_sources_config()
    for src in cfg.get("sources", []):
        if src.get("id") == source_id:
            return src
    return None


def get_enabled_sources(config: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """Retrieve all currently enabled sources."""
    cfg = config or load_sources_config()
    return [src for src in cfg.get("sources", []) if src.get("enabled", False)]
