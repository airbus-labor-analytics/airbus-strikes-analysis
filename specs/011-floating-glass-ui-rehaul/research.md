# Research & Architectural Decisions: Rehaul Visual Flotante "Liquid Glass"

## 1. Floating Navigation Layering

### Decision
Implement a 3-tier floating navigation hierarchy:
1. **Top**: Auto-contracting Dynamic Island HUD (`#floating-hud`) displaying real-time financial telemetry (AIR.PA stock price, strike days, asymmetry ratio).
2. **Bottom**: Global Floating Dock (`#global-floating-dock`) centered with backdrop blur (`blur(24px)`) for primary module switching and quick tools (PDF, Top).
3. **Right Margins**: Subtle vertical text hairline index (`#floating-section-nav`) visible on ultra-wide viewports (`2xl:block`) without constricting or shifting the centered `max-w-7xl` container.

### Rationale
- Decouples global page switching from section navigation.
- Preserves full horizontal screen width on desktop and mobile.
- Zero obstruction of charts, cards, or tables.

### Alternatives Considered
- *Fixed Left Sidebar*: Rejected due to artificial width constriction and dated layout aesthetics.
- *Sticky Mega-Header*: Rejected because it consumes valuable vertical reading area on laptops and tablets.

---

## 2. Minimalist Table of Contents Index

### Decision
Render a text-only vertical list styled with subtle slate typography (`text-slate-500 hover:text-slate-300`) over a 1px border line (`border-l border-slate-800`). Active sections scale lightly (`scale-105 origin-left`) with cyan text (`text-sky-400 font-semibold`) and active left border indicator (`border-l-2 border-sky-400`).

### Rationale
- Zero box clutter or visual heaviness.
- Positioned exclusively in the viewport's right margin gutters on 2xl screens.
- Completely preserves centered layout symmetry of the main analysis container.

---

## 3. Disaggregation and Comparative Visual Blocks

### Decision
Format complex information (Airbus SE financials vs Workers' losses, 10-dimension proposal matrices, Beluga logistics bottlenecks) into atomic cards with 8pt grid gaps (`gap-4`, `gap-6`) and high-contrast "Company vs Workers" dual cards.

### Rationale
- Maximizes cognitive clarity for workers, delegates, and journalists.
- Directly juxtaposes Airbus record profits (€4,960M) against the moderate cost of the workers' platform (€118M/year).
