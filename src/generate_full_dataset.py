#!/usr/bin/env python3
"""
Standalone generator for conflict_metrics.json and dashboard/data.js.

Usage:
    python3 src/generate_full_dataset.py

Both output paths default to the project root locations. Override with:
    python3 src/generate_full_dataset.py --export-json /path/to/out.json \
                                         --export-dashboard /path/to/data.js
"""
import sys
from pathlib import Path

# Allow running from any directory
sys.path.insert(0, str(Path(__file__).resolve().parent))

from analysis_engine import main  # reuse the same argparse + export logic

if __name__ == "__main__":
    main()
