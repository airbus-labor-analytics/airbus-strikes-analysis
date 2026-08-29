#!/usr/bin/env python3
"""
Publication-Grade Executive PDF Generator for Airbus Spain 2026 Strike Guide.
Executes render_document.js to compile Markdown with custom SVG graphics to HTML,
then uses Headless Chromium to generate a clean PDF without browser headers/footers.
"""
import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
DEFAULT_MD = PROJECT_ROOT / "docs" / "Guia_Estrategica_Negociacion_Huelga_Airbus_2026.md"
DEFAULT_PDF = PROJECT_ROOT / "docs" / "Guia_Estrategica_Negociacion_Huelga_Airbus_2026.pdf"
RENDER_HTML = Path("/tmp/guia_airbus_final.html")


def check_dependencies():
    """Verify Node.js and Chromium/Chrome are installed."""
    if not shutil.which("node"):
        print("Error: Node.js is required but not found in PATH.", file=sys.stderr)
        sys.exit(1)

    candidates = [
        shutil.which("chromium"),
        shutil.which("google-chrome"),
        shutil.which("google-chrome-stable"),
        shutil.which("chromium-browser"),
        shutil.which("chrome"),
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium-browser",
        "/usr/bin/chromium",
        "/snap/bin/chromium",
    ]
    for c in candidates:
        if c and os.path.exists(c) and os.access(c, os.X_OK):
            return str(c)

    print("Error: Chromium/Google Chrome is required for PDF printing.", file=sys.stderr)
    sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Generate Executive PDF for Airbus Strike Analysis.")
    parser.add_argument("-i", "--input", type=Path, default=DEFAULT_MD, help="Path to input Markdown file")
    parser.add_argument("-o", "--output", type=Path, default=DEFAULT_PDF, help="Path to output PDF file")
    parser.add_argument("--html-only", action="store_true", help="Generate HTML only, do not print PDF")
    args = parser.parse_args()

    browser_bin = check_dependencies()

    if not args.input.exists():
        print(f"Error: Input file '{args.input}' does not exist.", file=sys.stderr)
        sys.exit(1)

    args.output.parent.mkdir(parents=True, exist_ok=True)

    # Step 1: Render Markdown + SVGs to HTML
    render_script = SCRIPT_DIR / "render_document.js"
    cmd_render = ["node", str(render_script), str(args.input), str(RENDER_HTML)]
    print(f"Rendering HTML from {args.input}...")
    res_render = subprocess.run(cmd_render, capture_output=True, text=True)
    if res_render.returncode != 0:
        print(f"Error rendering HTML:\n{res_render.stderr}", file=sys.stderr)
        sys.exit(1)

    if args.html_only:
        print(f"HTML ready at {RENDER_HTML}")
        return

    # Step 2: Compile to PDF via Chromium
    print(f"Compiling PDF via {browser_bin}...")
    cmd_pdf = [
        browser_bin,
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--no-pdf-header-footer",
        f"--print-to-pdf={args.output.resolve()}",
        str(RENDER_HTML)
    ]

    res_pdf = subprocess.run(cmd_pdf, capture_output=True, text=True)
    if res_pdf.returncode == 0 and args.output.exists():
        size_kb = args.output.stat().st_size / 1024
        print(f"✓ PDF successfully generated: {args.output} ({size_kb:.1f} KB)")
    else:
        print(f"Error generating PDF:\n{res_pdf.stderr}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
