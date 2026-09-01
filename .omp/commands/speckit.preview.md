---
description: 'Capture and preview dashboard visual modules directly in the terminal or floating Wayland window'
---

## User Input

```text
$ARGUMENTS
```

## Outline

This command renders high-fidelity visual previews of the Airbus Strikes Analytics Dashboard directly in your terminal using 24-bit TrueColor ANSI half-blocks, and optionally launches the native Wayland image viewer (`imv`).

### Usage

- `/speckit.preview portal` — Preview Module 0 (Portal Hub)
- `/speckit.preview finanzas` — Preview Module 1 (Financial Overview & Asymmetry)
- `/speckit.preview beluga` — Preview Module 2 (Beluga Logistics & Industrial Bottlenecks)
- `/speckit.preview salarios` — Preview Module 3 (Purchasing Power & Wages Simulator)
- `/speckit.preview sindicatos` — Preview Module 4 (Union Force & Assembly Map)
- `/speckit.preview evidencias` — Preview Module 5 (Document Compendium)
- `/speckit.preview <path-to-image>` — View any captured screenshot directly in the terminal

### Execution

Run the bundled preview utility:
```bash
bun scripts/capture_and_view.js $ARGUMENTS
```
