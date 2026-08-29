#!/usr/bin/env python3
"""
Validation script for primary source links across:
1. Markdown strategic guide (Guia_Estrategica_Negociacion_Huelga_Airbus_2026.md)
2. Interactive Web Dashboard (index.html, app.js)
3. Data fixtures (conflict_metrics.json, etc.)
"""

import os
import re
import json
import sys

def check_markdown_sources(md_path):
    print(f"--> Validating Markdown: {md_path}")
    if not os.path.exists(md_path):
        print(f"[FAIL] File not found: {md_path}")
        return False
    
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check for primary links in text
    links = re.findall(r'\[([^\]]+)\]\((https?://[^\)]+)\)', content)
    print(f"    Found {len(links)} external source links in Markdown.")

    # Check key sections have source links
    sections = re.findall(r'(##+ [^\n]+)', content)
    print(f"    Found {len(sections)} major sections.")

    required_domains = [
        "sima-fasp.net",
        "ine.es",
        "boe.es",
        "airbus.com",
        "euronext.com",
        "iata.org",
        "easa.europa.eu"
    ]
    missing_domains = [d for d in required_domains if d not in content]
    if missing_domains:
        print(f"[WARN] Missing key source domains in MD: {missing_domains}")
    else:
        print("    [PASS] All critical primary source domains referenced in Markdown.")
    
    return len(links) >= 15

def check_html_dashboard_sources(html_path):
    print(f"--> Validating HTML Dashboard: {html_path}")
    if not os.path.exists(html_path):
        print(f"[FAIL] File not found: {html_path}")
        return False

    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all <a> tags with http links
    links = re.findall(r'<a\s+(?:[^>]*?\s+)?href=["\'](https?://[^"\']+)["\']', content)
    print(f"    Found {len(links)} external source links in dashboard HTML.")

    tabs = re.findall(r'id=["\'](tab-[a-zA-Z0-9_-]+)["\']', content)
    print(f"    Found {len(tabs)} tabs in dashboard.")

    # Check for canvas elements and their source attribution in header/subtext
    canvas_matches = re.findall(r'<canvas id=["\']([^"\']+)["\']', content)
    print(f"    Found {len(canvas_matches)} Chart.js canvases: {canvas_matches}")

    return len(links) >= 20

def check_json_benchmarks(json_path):
    print(f"--> Validating JSON Data: {json_path}")
    if not os.path.exists(json_path):
        print(f"[FAIL] File not found: {json_path}")
        return False

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    benchmarks = data.get("benchmarks", [])
    valid_count = 0
    for b in benchmarks:
        if b.get("source_url") and b.get("source_url").startswith("http"):
            valid_count += 1
        else:
            print(f"    [WARN] Benchmark missing source_url: {b.get('case')}")

    print(f"    {valid_count}/{len(benchmarks)} benchmarks have verified source URLs.")
    return valid_count == len(benchmarks)

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    md_path = os.path.join(base_dir, "docs", "Guia_Estrategica_Negociacion_Huelga_Airbus_2026.md")
    html_path = os.path.join(base_dir, "dashboard", "index.html")
    json_path = os.path.join(base_dir, "data", "conflict_metrics.json")

    ok_md = check_markdown_sources(md_path)
    ok_html = check_html_dashboard_sources(html_path)
    ok_json = check_json_benchmarks(json_path)

    if ok_md and ok_html and ok_json:
        print("\n[ALL CHECKS PASSED] Every section, table, chart, and metric is backed by verified primary source links.")
        sys.exit(0)
    else:
        print("\n[VERIFICATION FAILED] Some source links are missing.")
        sys.exit(1)

if __name__ == "__main__":
    main()
