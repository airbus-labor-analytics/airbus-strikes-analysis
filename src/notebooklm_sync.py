#!/usr/bin/env python3
"""
NotebookLM Automated Sync & Source Downloader for Airbus Spain 2026 Strike Analysis.
Synchronizes all 269+ sources, indexed fulltexts, generated reports, mind maps,
and artifacts from Google NotebookLM into the repository under sources/ and data/.
"""
import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Any

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SOURCES_DIR = PROJECT_ROOT / "sources"
ARTIFACTS_DIR = SOURCES_DIR / "artifacts"
FULLTEXT_DIR = SOURCES_DIR / "fulltext"
DATA_DIR = PROJECT_ROOT / "data"

DEFAULT_NOTEBOOK_ID = "602774aa-f859-4d52-a3e4-87afb7761d15"


def sanitize_filename(name: str) -> str:
    """Sanitize title for safe filesystem storage."""
    clean = re.sub(r'[\\/*?:"<>|]', "", name)
    clean = clean.replace(" ", "_").strip(".")
    return clean[:100]


def run_cli_json(cmd: List[str]) -> Any:
    """Executes notebooklm CLI and parses JSON output."""
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return json.loads(res.stdout)
    except subprocess.CalledProcessError as e:
        print(f"CLI error running {' '.join(cmd)}:\n{e.stderr}", file=sys.stderr)
        return None
    except json.JSONDecodeError:
        print(f"Failed to parse JSON response from {' '.join(cmd)}", file=sys.stderr)
        return None


class NotebookLMSync:
    def __init__(self, notebook_id: str = DEFAULT_NOTEBOOK_ID):
        self.notebook_id = notebook_id
        SOURCES_DIR.mkdir(parents=True, exist_ok=True)
        ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
        FULLTEXT_DIR.mkdir(parents=True, exist_ok=True)

    def sync_sources_metadata(self) -> List[Dict[str, Any]]:
        """Downloads complete list of sources in the notebook."""
        print(f"▶ Fetching sources metadata from NotebookLM ({self.notebook_id})...")
        data = run_cli_json(["notebooklm", "source", "list", "-n", self.notebook_id, "--json"])
        if not data or "sources" not in data:
            print("Failed to fetch sources.", file=sys.stderr)
            return []

        sources = data.get("sources", [])
        index_file = SOURCES_DIR / "sources_index.json"
        with open(index_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"✓ Saved index of {len(sources)} sources to {index_file}")
        return sources

    def sync_artifacts(self) -> List[Dict[str, Any]]:
        """Downloads generated artifacts (reports, mind maps, infographics)."""
        print(f"▶ Fetching artifacts list from NotebookLM ({self.notebook_id})...")
        data = run_cli_json(["notebooklm", "artifact", "list", "-n", self.notebook_id, "--json"])
        if not data or "artifacts" not in data:
            print("No artifacts found or error fetching artifacts.", file=sys.stderr)
            return []

        artifacts = data.get("artifacts", [])
        artifacts_index = ARTIFACTS_DIR / "artifacts_index.json"
        with open(artifacts_index, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"✓ Found {len(artifacts)} artifacts. Downloading available items...")
        for art in artifacts:
            art_id = art["id"]
            title = art["title"]
            art_type = art.get("type_id", "").lower()
            safe_title = sanitize_filename(title)

            if "report" in art_type or "report" in title.lower():
                out_path = ARTIFACTS_DIR / f"{safe_title}.md"
                cmd = ["notebooklm", "download", "report", str(out_path), "-n", self.notebook_id, "-a", art_id]
                subprocess.run(cmd, capture_output=True)
                if out_path.exists():
                    print(f"  ✓ Downloaded Report: {out_path.name}")

            elif "mind_map" in art_type or "map" in art_type:
                out_path = ARTIFACTS_DIR / f"{safe_title}.json"
                cmd = ["notebooklm", "download", "mind-map", str(out_path), "-n", self.notebook_id, "-a", art_id]
                subprocess.run(cmd, capture_output=True)
                if out_path.exists():
                    print(f"  ✓ Downloaded Mind Map: {out_path.name}")

            elif "infographic" in art_type:
                out_path = ARTIFACTS_DIR / f"{safe_title}.png"
                cmd = ["notebooklm", "download", "infographic", str(out_path), "-n", self.notebook_id, "-a", art_id]
                subprocess.run(cmd, capture_output=True)
                if out_path.exists():
                    print(f"  ✓ Downloaded Infographic: {out_path.name}")

        return artifacts

    def sync_key_fulltexts(self, sources: List[Dict[str, Any]], limit: int = 50):
        """Downloads full indexed texts for primary key sources."""
        print(f"▶ Downloading fulltext for top {min(limit, len(sources))} key sources...")
        count = 0
        for src in sources[:limit]:
            src_id = src["id"]
            title = src["title"]
            safe_title = sanitize_filename(title)
            out_file = FULLTEXT_DIR / f"{safe_title}_{src_id[:8]}.json"

            if out_file.exists():
                continue

            cmd = ["notebooklm", "source", "fulltext", src_id, "-n", self.notebook_id, "--json"]
            text_data = run_cli_json(cmd)
            if text_data and "content" in text_data:
                with open(out_file, "w", encoding="utf-8") as f:
                    json.dump(text_data, f, indent=2, ensure_ascii=False)
                count += 1

        print(f"✓ Saved {count} fulltext files to {FULLTEXT_DIR}")


def main():
    parser = argparse.ArgumentParser(description="NotebookLM Sync Tool for Airbus Strike Analysis")
    parser.add_argument("-n", "--notebook", default=DEFAULT_NOTEBOOK_ID, help="NotebookLM notebook ID")
    parser.add_argument("--all", action="store_true", help="Download metadata, artifacts, and key fulltexts")
    parser.add_argument("--limit-fulltext", type=int, default=30, help="Max fulltext sources to download")
    args = parser.parse_args()

    syncer = NotebookLMSync(notebook_id=args.notebook)
    sources = syncer.sync_sources_metadata()
    syncer.sync_artifacts()

    if args.all or args.limit_fulltext > 0:
        syncer.sync_key_fulltexts(sources, limit=args.limit_fulltext)

    print("\n✓ NotebookLM Synchronization completed successfully.")


if __name__ == "__main__":
    main()
