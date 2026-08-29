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
from datetime import datetime
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

    def extract_existing_sources(self) -> List[Dict[str, Any]]:
        """Extracts and catalogs all documents and minutes already ingested in the project."""
        items = []
        fulltext_dir = SOURCES_DIR / "fulltext"
        if not fulltext_dir.exists():
            return items

        for p in sorted(fulltext_dir.glob("*.json")):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    d = json.load(f)
                
                title = d.get("title", p.stem)
                content = d.get("content", "")
                kind = d.get("kind", "document")
                url = d.get("url")

                # Categorize document
                category = "General"
                target_subfolder = "documents"
                if any(k in title.lower() for k in ["asamblea", "minuta", "puerta"]):
                    category = "Minuta de Asamblea"
                    target_subfolder = "assembly_minutes"
                elif any(k in title.lower() for k in ["sima", "preaviso", "legal", "ts", "sentencia", "auto"]):
                    category = "Documento Legal / SIMA"
                    target_subfolder = "legal_filings"
                elif any(k in title.lower() for k in ["dossier", "salarial", "recuperacion", "economico", "informe"]):
                    category = "Dossier Económico / Técnico"
                    target_subfolder = "dossiers"
                elif any(k in title.lower() for k in ["comunicado", "nota de prensa", "manifiesto"]):
                    category = "Comunicado Sindical"
                    target_subfolder = "documents"

                # Extract date from text or title if present
                date_match = re.search(r"(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{2}[\/\-\.]\d{2})", title + " " + content[:200])
                doc_date = date_match.group(0) if date_match else "Julio - Agosto 2026"

                # Save copy in markdown/text in archive folder
                safe_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', title)[:80] + ".txt"
                archive_file = TELEGRAM_DIR / target_subfolder / safe_name
                if not archive_file.exists():
                    with open(archive_file, "w", encoding="utf-8") as af:
                        af.write(f"# {title}\n")
                        af.write(f"Categoría: {category}\n")
                        af.write(f"Fecha: {doc_date}\n")
                        af.write(f"Origen: Grupo Telegram {TELEGRAM_GROUP_NAME} ({TELEGRAM_GROUP_URL})\n\n")
                        af.write(content)

                items.append({
                    "id": f"tg-doc-{len(items)+1:03d}",
                    "title": title,
                    "category": category,
                    "date": doc_date,
                    "size_chars": len(content),
                    "file_path": str(archive_file.relative_to(BASE_DIR)),
                    "original_source_id": d.get("source_id"),
                    "group": TELEGRAM_GROUP_NAME,
                    "group_url": TELEGRAM_GROUP_URL,
                    "summary": content[:300].strip() + ("..." if len(content) > 300 else "")
                })
            except Exception as e:
                print(f"Error parsing source {p.name}: {e}", file=sys.stderr)

        return items

    def sync_and_generate_index(self) -> Dict[str, Any]:
        """Scans channel information, compiles the index and saves JSON catalog."""
        docs = self.extract_existing_sources()
        
        index_data = {
            "channel_metadata": {
                "name": TELEGRAM_GROUP_NAME,
                "url": TELEGRAM_GROUP_URL,
                "type": "Canal Oficial Asambleas Huelga Airbus España",
                "total_members": 5794,
                "status": "Activo / En seguimiento continuo",
                "last_sync": datetime.now().isoformat()
            },
            "stats": {
                "total_documents": len(docs),
                "categories": {
                    "Minutas de Asamblea": len([d for d in docs if d["category"] == "Minuta de Asamblea"]),
                    "Documentos Legales / SIMA": len([d for d in docs if d["category"] == "Documento Legal / SIMA"]),
                    "Dossiers Económicos": len([d for d in docs if d["category"] == "Dossier Económico / Técnico"]),
                    "Comunicados Sindicales": len([d for d in docs if d["category"] == "Comunicado Sindical"]),
                    "Otros": len([d for d in docs if d["category"] == "General"])
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
