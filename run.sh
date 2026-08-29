#!/usr/bin/env bash
# Quick CLI runner for Airbus Spain 2026 Strike Analytics Suite
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

case "$1" in
  pdf)
    python3 src/generate_pdf.py "${@:2}"
    ;;
  data)
    python3 src/analysis_engine.py "${@:2}"
    ;;
  beluga)
    python3 src/beluga_tracker.py "${@:2}"
    ;;
  thermo)
    python3 src/sentiment_thermometer.py "${@:2}"
    ;;
  sync)
    python3 src/notebooklm_sync.py --all "${@:2}"
    ;;
  dashboard)
    python3 cli.py dashboard "${@:2}"
    ;;
  build)
    python3 src/analysis_engine.py
    python3 src/generate_pdf.py
    ;;
  *)
    python3 cli.py "${@}"
    ;;
esac
