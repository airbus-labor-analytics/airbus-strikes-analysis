# Quickstart & Verification Guide

## 1. Automated Verification Suite

Run all validation scripts and unittests:

```bash
# 1. Invariant & Econometric Consistency Test
python3 src/validate_invariants.py

# 2. Primary Source Reference Integrity Test
python3 src/validate_sources.py

# 3. Comprehensive Unit & DOM Balance Test Suite (55 tests)
python3 -m unittest discover tests/
```

## 2. Interactive Browser Verification

Preview the dashboard in browser or headless test environment:

```bash
# Open local dashboard
xd://browser { "action": "open", "url": "file:///home/sergio/programming/airbus-strikes-analysis/dashboard/index.html" }
```

### Visual Verification Checkpoints:
1. **No Left Sidebar**: Verify the left sidebar is completely absent and content is centered in `max-w-7xl mx-auto`.
2. **Top Dynamic Island HUD**: Verify contraction on scroll down (>120px) and expansion on return to top.
3. **Global Floating Dock**: Verify clicking any of the 6 module pills instantaneously changes tabs, resets scroll, and triggers chart redraws.
4. **Subtle Right-Hand Section Index**: On `2xl` screens, verify the vertical text index highlights the active section during scroll with smooth zoom and cyan line indicator.
5. **Glass Detail Modal**: Verify clicking "Ver Contenido" opens the modal with backdrop blur and closes with `Escape` or the close button.
