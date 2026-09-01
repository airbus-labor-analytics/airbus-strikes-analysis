# Contract: Beluga Recent Movements UI & Client Lifecycle

**Feature**: `015-beluga-last-movements`  
**Contract ID**: `beluga-movements-ui-v1`  
**Status**: Active  

---

## 1. DOM Hierarchy & Component Structure (`dashboard/index.html`)

Located inside `#tab-industrial` (`Industrial & Logística` module):

```html
<!-- Recent Beluga Movements Section -->
<div id="sec-industrial-movements" class="glass-card p-5 sm:p-6 rounded-2xl border-slate-800 space-y-4">
  <div class="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-3 gap-2">
    <div>
      <h3 class="text-sm font-bold text-white flex items-center">
        <i data-lucide="history" class="w-4 h-4 mr-2 text-sky-400"></i>
        Registro de Últimos Movimientos & Vuelos BelugaXL
      </h3>
      <p class="text-xs text-slate-400 mt-0.5">Trazabilidad de trayectos inter-factorías y verificación de cese de operaciones en Getafe.</p>
    </div>
    <div class="flex items-center gap-2">
      <span id="movements-count-badge" class="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-sky-300 border border-slate-700 rounded-lg">
        0 registros
      </span>
    </div>
  </div>

  <!-- Movements List Container -->
  <div id="beluga-movements-container" class="space-y-2">
    <!-- Dynamically populated by renderBelugaMovements() -->
  </div>
</div>
```

---

## 2. JavaScript Functions & State Lifecycle (`dashboard/app.js`)

- `renderBelugaMovements(beluga)`: Renders flight movement items filtered by `selectedBelugaTail`.
- `initBelugaLogistics()`: Invokes `renderBelugaFleet(beluga)`, `renderBelugaRoutes(beluga)`, and `renderBelugaMovements(beluga)`.
- `setBelugaTailFilter(tail)`: Re-evaluates both fleet cards and movements container.
