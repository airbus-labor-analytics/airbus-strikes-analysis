#!/usr/bin/env python3
"""
Airbus Strike Analytics CLI Suite
Unified launcher for data modeling, PDF publication generation, NotebookLM synchronization, and web dashboard server.
"""
import argparse
import os
import subprocess
import sys
import webbrowser
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent


def run_data_engine():
    print("▶ Running econometric analysis engine...")
    cmd = [sys.executable, str(PROJECT_ROOT / "src" / "analysis_engine.py")]
    subprocess.run(cmd, check=True)


def run_pdf_generator():
    print("▶ Generating publication-grade executive PDF...")
    cmd = [sys.executable, str(PROJECT_ROOT / "src" / "generate_pdf.py")]
    subprocess.run(cmd, check=True)


def run_sync_notebooklm(limit=30):
    print("▶ Synchronizing sources and artifacts with Google NotebookLM...")
    cmd = [sys.executable, str(PROJECT_ROOT / "src" / "notebooklm_sync.py"), "--all", "--limit-fulltext", str(limit)]
    subprocess.run(cmd, check=True)


def run_dashboard(port=8080, open_browser=True):
    print(f"▶ Launching Interactive Web Dashboard on http://localhost:{port}/dashboard/ ...")
    if open_browser:
        try:
            webbrowser.open(f"http://localhost:{port}/dashboard/")
        except Exception:
            pass

    cmd = [sys.executable, "-m", "http.server", str(port), "--directory", str(PROJECT_ROOT)]
    try:
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\nDashboard server stopped.")


def main():
    parser = argparse.ArgumentParser(
        description="Airbus Spain 2026 Strike: Strategic & Financial Analytics Suite",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Commands:
  dashboard  Launch the local interactive analytics web dashboard
  pdf        Compile Markdown + SVG graphics into an 8-page publication PDF
  data       Run econometric modeling and export conflict_metrics.json
  sync       Download and synchronize all 269+ sources and artifacts from NotebookLM
  all        Run data modeling, sync NotebookLM, compile PDF, and launch the dashboard
        """
    )
    parser.add_argument("command", choices=["dashboard", "pdf", "data", "sync", "all"], nargs="?", default="dashboard", help="Command to run")
    parser.add_argument("--port", type=int, default=8080, help="Port for dashboard web server (default: 8080)")
    parser.add_argument("--no-browser", action="store_true", help="Do not automatically open browser")
    parser.add_argument("--limit-sync", type=int, default=30, help="Max fulltext files to download in sync (default: 30)")

    args = parser.parse_args()

    if args.command == "data":
        run_data_engine()
    elif args.command == "pdf":
        run_pdf_generator()
    elif args.command == "sync":
        run_sync_notebooklm(limit=args.limit_sync)
    elif args.command == "dashboard":
        run_data_engine()
        run_dashboard(port=args.port, open_browser=not args.no_browser)
    elif args.command == "all":
        run_data_engine()
        run_sync_notebooklm(limit=args.limit_sync)
        run_pdf_generator()
        run_dashboard(port=args.port, open_browser=not args.no_browser)


if __name__ == "__main__":
    main()
