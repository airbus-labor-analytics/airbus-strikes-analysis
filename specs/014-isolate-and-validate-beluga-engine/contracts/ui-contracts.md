# Contract: Beluga Logistics UI & Client Lifecycle

**Feature**: `014-isolate-and-validate-beluga-engine`  
**Contract ID**: `beluga-ui-v2`  
**Status**: Active  

---

## 1. DOM Hierarchy & Component Structure (`dashboard/index.html`)

Located inside `#tab-industrial` (`Industrial & Logistics` view):

```html
<!-- Beluga Fleet Radar & Airframe Status -->
<div class="glass-card p-4 rounded-xl border border-sky-500/30">
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
    <div>
      <h3 class="text-sm sm:text-base font-black text-white flex items-center">
        <i data-lucide="plane" class="w-4 h-4 mr-2 text-sky-400"></i>
        Flota BelugaXL & Cuello de Botella Logístico JIT
      </h3>
      <p class="text-[11px] text-slate-400 mt-0.5">Telemetría de radar ADS-B en vivo e impacto en las FALs europeas</p>
    </div>
    <!-- Tail Filter Buttons -->
    <div class="flex flex-wrap items-center gap-1 text-xs" id="beluga-tail-filters">
      <button onclick="setBelugaTailFilter('ALL')" data-tail="ALL" class="beluga-tail-btn ...">Todas (6)</button>
      <button onclick="setBelugaTailFilter('F-GXLG')" data-tail="F-GXLG" class="beluga-tail-btn ...">XL1 (F-GXLG)</button>
      <button onclick="setBelugaTailFilter('F-GXLH')" data-tail="F-GXLH" class="beluga-tail-btn ...">XL2 (F-GXLH)</button>
      <button onclick="setBelugaTailFilter('F-GXLI')" data-tail="F-GXLI" class="beluga-tail-btn ...">XL3 (F-GXLI)</button>
      <button onclick="setBelugaTailFilter('F-GXLJ')" data-tail="F-GXLJ" class="beluga-tail-btn ...">XL4 (F-GXLJ)</button>
      <button onclick="setBelugaTailFilter('F-GXLN')" data-tail="F-GXLN" class="beluga-tail-btn ...">XL5 (F-GXLN)</button>
      <button onclick="setBelugaTailFilter('F-GXLO')" data-tail="F-GXLO" class="beluga-tail-btn ...">XL6 (F-GXLO)</button>
    </div>
  </div>

  <!-- Live Aircraft Cards Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" id="beluga-fleet-grid">
    <!-- Populated by renderBelugaFleet() -->
  </div>

  <!-- European Routes Matrix (No fabricated charts) -->
  <div class="mt-4 pt-4 border-t border-slate-800">
    <h4 class="text-xs font-bold text-slate-300 mb-2 flex items-center">
      <i data-lucide="network" class="w-3.5 h-3.5 mr-1.5 text-sky-400"></i>
      Estado de las Rutas de Suministro entre Factorías y FALs Europeas
    </h4>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2" id="beluga-routes-grid">
      <!-- Populated by renderBelugaFleet() -->
    </div>
  </div>
</div>
```

---

## 2. Client-Side Lifecycle Functions (`dashboard/app.js`)

### Function: `initBelugaLogistics()`
- **Purpose**: Initializes the Beluga logistics component on tab switch or page load.
- **Data Source**: `conflictData.beluga_logistics` or `data/beluga_status.json`.
- **Rendering**: Calls `renderBelugaFleet(data)`.

### Function: `renderBelugaFleet(belugaData)`
- **Purpose**: Renders the 6 aircraft cards into `#beluga-fleet-grid` respecting the selected tail filter (`selectedBelugaTail`).
- **Route Matrix**: Renders the supply chain corridor badges into `#beluga-routes-grid`.

### Function: `setBelugaTailFilter(tail)`
- **Purpose**: Sets `selectedBelugaTail = tail`, updates active button styles, and re-renders `#beluga-fleet-grid`.

### Function: `startBelugaLivePolling()`
- **Purpose**: Polls `data/beluga_status.json` every 30 seconds when the document is visible.
- **Decoupling**: Runs independently of `thermometerPollingInterval`.

---

## 3. Removed Elements & Deprecations

- **`<canvas id="belugaHistoryChart">`**: REMOVED.
- **`let belugaHistoryChart`**: REMOVED.
- **`updateBelugaChart()`**: REMOVED.
- **`initThermometerAndBeluga()`**: SPLIT into `initBelugaLogistics()` and `initThermometer()`.
