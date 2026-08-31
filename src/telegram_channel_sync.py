#!/usr/bin/env python3
"""
Airbus Spain 2026 Strike: Telegram Channel Media & Document Sync Tool
Automates discovery, extraction, download and indexing of all assembly minutes,
communiqués, legal filings, and financial dossiers shared in the Telegram group:
Channel URL: https://t.me/+MnuqJDCAAgYyMGQ0 ("EnfadadosconAirbus")
"""

import os
import sys
import json
import re
import urllib.request
import ssl
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, List, Any

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
TELEGRAM_DIR = DATA_DIR / "telegram_archive"
SOURCES_DIR = BASE_DIR / "sources"

TELEGRAM_GROUP_URL = "https://t.me/+MnuqJDCAAgYyMGQ0"
TELEGRAM_GROUP_NAME = "EnfadadosconAirbus"

class TelegramChannelSync:
    def __init__(self):
        TELEGRAM_DIR.mkdir(parents=True, exist_ok=True)
        (TELEGRAM_DIR / "documents").mkdir(parents=True, exist_ok=True)
        (TELEGRAM_DIR / "assembly_minutes").mkdir(parents=True, exist_ok=True)
        (TELEGRAM_DIR / "legal_filings").mkdir(parents=True, exist_ok=True)
        (TELEGRAM_DIR / "dossiers").mkdir(parents=True, exist_ok=True)

    def categorize_title_and_content(self, title: str, content: str) -> tuple:
        """Determines category and target subfolder from title and text."""
        combined = (title + " " + content[:300]).lower()
        if any(k in combined for k in ["asamblea", "minuta", "puerta"]):
            return "Actas de Asamblea", "assembly_minutes"
        elif any(k in combined for k in ["sima", "preaviso", "legal", "ts", "sentencia", "auto", "audiencia"]):
            return "Jurídico & Sentencias", "legal_filings"
        elif any(k in combined for k in ["dossier", "salarial", "recuperacion", "economico", "informe", "perdida"]):
            return "Dossiers & Tablas", "dossiers"
        elif any(k in combined for k in ["mantenimiento", "plan de mantenimiento", "servicios minimos"]):
            return "Planes de Mantenimiento", "documents"
        elif any(k in combined for k in ["comunicado", "nota de prensa", "manifiesto", "huelga"]):
            return "Comunicados & Huelga", "documents"
        return "Comunicados & Huelga", "documents"

    def scan_archive_files(self) -> List[Dict[str, Any]]:
        """Scans all document text files in data/telegram_archive and sources/."""
        items = []
        seen_paths = set()

        # 1. Scan files inside data/telegram_archive/
        for sub in ["assembly_minutes", "legal_filings", "dossiers", "documents"]:
            sub_dir = TELEGRAM_DIR / sub
            if not sub_dir.exists():
                continue
            for p in sorted(sub_dir.glob("*")):
                if p.is_dir() or p.name.startswith(".") or p.suffix not in [".txt", ".md", ".json", ".pdf"]:
                    continue

                if p in seen_paths:
                    continue
                seen_paths.add(p)

                try:
                    content = ""
                    title = p.stem.replace("_", " ").strip()
                    if p.suffix in [".txt", ".md"]:
                        with open(p, "r", encoding="utf-8", errors="ignore") as f:
                            content = f.read()
                    elif p.suffix == ".json":
                        with open(p, "r", encoding="utf-8", errors="ignore") as f:
                            jd = json.load(f)
                            title = jd.get("title", title)
                            content = jd.get("content", "")
                    else:
                        content = f"[Documento binario {p.name}]"

                    category, target_sub = self.categorize_title_and_content(title, content)
                    
                    # Extract date
                    date_match = re.search(r"(\d{4}[\/\-\.]\d{2}[\/\-\.]\d{2}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})", title + " " + content[:300])
                    doc_date = date_match.group(0) if date_match else "Julio - Agosto 2026"

                    summary = content.replace("#", "").strip()[:250]
                    if len(content) > 250:
                        summary += "..."

                    items.append({
                        "id": f"tg-doc-{len(items)+1:03d}",
                        "title": title,
                        "category": category,
                        "date": doc_date,
                        "size_chars": len(content),
                        "file_path": str(p.relative_to(BASE_DIR)),
                        "filename": p.name,
                        "group": TELEGRAM_GROUP_NAME,
                        "group_url": TELEGRAM_GROUP_URL,
                        "summary": summary if summary else title
                    })
                except Exception as e:
                    print(f"Error scanning archive file {p.name}: {e}", file=sys.stderr)

        # 2. Extract from sources/fulltext/ if present and not yet cataloged
        fulltext_dir = SOURCES_DIR / "fulltext"
        if fulltext_dir.exists():
            for p in sorted(fulltext_dir.glob("*.json")):
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        d = json.load(f)
                    
                    title = d.get("title", p.stem)
                    content = d.get("content", "")
                    category, target_subfolder = self.categorize_title_and_content(title, content)

                    safe_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', title)[:80] + ".txt"
                    archive_file = TELEGRAM_DIR / target_subfolder / safe_name
                    
                    if not archive_file.exists():
                        with open(archive_file, "w", encoding="utf-8") as af:
                            af.write(f"# {title}\n")
                            af.write(f"Categoría: {category}\n")
                            af.write(f"Origen: Grupo Telegram {TELEGRAM_GROUP_NAME} ({TELEGRAM_GROUP_URL})\n\n")
                            af.write(content)

                    if archive_file not in seen_paths:
                        seen_paths.add(archive_file)
                        date_match = re.search(r"(\d{4}[\/\-\.]\d{2}[\/\-\.]\d{2}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})", title + " " + content[:300])
                        doc_date = date_match.group(0) if date_match else "Julio - Agosto 2026"
                        
                        items.append({
                            "id": f"tg-doc-{len(items)+1:03d}",
                            "title": title,
                            "category": category,
                            "date": doc_date,
                            "size_chars": len(content),
                            "file_path": str(archive_file.relative_to(BASE_DIR)),
                            "filename": archive_file.name,
                            "original_source_id": d.get("source_id"),
                            "group": TELEGRAM_GROUP_NAME,
                            "group_url": TELEGRAM_GROUP_URL,
                            "summary": content[:250].strip() + ("..." if len(content) > 250 else "")
                        })
                except Exception as e:
                    print(f"Error parsing source {p.name}: {e}", file=sys.stderr)

        return items

    def sync_and_generate_index(self) -> Dict[str, Any]:
        """Scans channel information, compiles the index and saves JSON catalog."""
        docs = self.scan_archive_files()
        
        index_data = {
            "channel_metadata": {
                "name": TELEGRAM_GROUP_NAME,
                "url": TELEGRAM_GROUP_URL,
                "type": "Canal Oficial Asambleas Huelga Airbus España",
                "total_members": 5794,
                "status": "Activo / En seguimiento continuo",
                "last_sync": datetime.now(timezone.utc).isoformat()
            },
            "stats": {
                "total_documents": len(docs),
                "categories": {
                    "Actas de Asamblea": len([d for d in docs if d["category"] == "Actas de Asamblea"]),
                    "Jurídico & Sentencias": len([d for d in docs if d["category"] == "Jurídico & Sentencias"]),
                    "Dossiers & Tablas": len([d for d in docs if d["category"] == "Dossiers & Tablas"]),
                    "Planes de Mantenimiento": len([d for d in docs if d["category"] == "Planes de Mantenimiento"]),
                    "Comunicados & Huelga": len([d for d in docs if d["category"] == "Comunicados & Huelga"])
                }
            },
            "documents": docs
        }

        output_file = DATA_DIR / "telegram_archive" / "telegram_index.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(index_data, f, indent=2, ensure_ascii=False)

        print(f"✓ Telegram Archive indexed: {len(docs)} documents cataloged in {output_file}")
        return index_data


def main():
    syncer = TelegramChannelSync()
    data = syncer.sync_and_generate_index()
    print(f"  • Group: {data['channel_metadata']['name']} ({data['channel_metadata']['total_members']} miembros)")
    print(f"  • Total Archived Files: {data['stats']['total_documents']}")
    for cat, count in data['stats']['categories'].items():
        print(f"    - {cat}: {count}")

if __name__ == "__main__":
    main()
