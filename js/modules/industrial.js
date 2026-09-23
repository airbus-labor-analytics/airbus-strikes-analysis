// ============================================================================
// dashboard/js/modules/industrial.js
// Module 2: Industrial Impact, Beluga Fleet & JIT Supply Chain Logistics
// ============================================================================

import { escapeHTML, sanitizeURL, showToast } from '../core.js';

export let selectedBelugaTail = 'ALL';
export let belugaPollingInterval = null;

export function initBelugaLogistics() {
  const beluga = window.CONFLICT_DATA?.beluga_logistics;
  if (!beluga) return;

  renderBelugaFleet(beluga.fleet || []);
  renderBelugaRoutes(beluga.routes || []);
  renderBelugaCitations(beluga.primary_sources || []);
  renderBelugaMovements(beluga.recent_movements || []);
  startBelugaLivePolling();
}

export function setBelugaTailFilter(tail) {
  selectedBelugaTail = tail;

  document.querySelectorAll('.beluga-tail-btn').forEach(btn => {
    btn.classList.remove('bg-blue-600', 'text-white', 'border-blue-500');
    btn.classList.add('bg-slate-900', 'text-slate-400', 'border-slate-800');
  });

  const activeBtn = document.getElementById(`btn-tail-${tail.toLowerCase()}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-slate-900', 'text-slate-400', 'border-slate-800');
    activeBtn.classList.add('bg-blue-600', 'text-white', 'border-blue-500');
  }

  const beluga = window.CONFLICT_DATA?.beluga_logistics;
  if (beluga) {
    renderBelugaFleet(beluga.fleet || []);
    renderBelugaMovements(beluga.recent_movements || []);
  }
}

export function renderBelugaFleet(fleet) {
  const fleetGrid = document.getElementById('beluga-fleet-grid');
  if (!fleetGrid) return;

  const filteredAircraft = selectedBelugaTail === 'ALL'
    ? fleet
    : fleet.filter(ac => (ac.tail && ac.tail.toUpperCase() === selectedBelugaTail.toUpperCase()) || (ac.name && ac.name.toUpperCase().includes(selectedBelugaTail.toUpperCase())));

  if (filteredAircraft.length === 0) {
    fleetGrid.innerHTML = `
      <div class="p-6 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-xl space-y-1.5 col-span-full">
        <p class="text-xs font-semibold text-slate-400">No hay aeronaves que coincidan con el filtro seleccionado.</p>
        <p class="text-[11px] text-slate-500 font-mono">Filtro activo: ${escapeHTML(selectedBelugaTail)}</p>
      </div>
    `;
    return;
  }

  fleetGrid.innerHTML = filteredAircraft.map(ac => {
    const isAirborne = ac.status === 'En Vuelo' || !!ac.airborne;
    const statusText = ac.status || (isAirborne ? 'En Vuelo' : 'En Tierra');
    const routeText = ac.current_site ? `Ubicación: ${ac.current_site}` : (ac.location_label || ac.locationLabel || 'Base Operativa');
    const safeRadarUrl = sanitizeURL(ac.radar_url || 'https://beluga.simcoe.co.uk/');

    return `
      <div class="p-3.5 bg-slate-900/80 border ${ac.has_alert ? 'border-amber-500/30' : 'border-slate-800'} rounded-xl space-y-2 hover:border-slate-700 transition">
        <div class="flex justify-between items-start">
          <div>
            <span class="text-xs font-black text-white font-mono">${escapeHTML(ac.tail || ac.name)}</span>
            <span class="text-[10px] text-slate-400 block">${escapeHTML(ac.msn ? 'MSN ' + ac.msn : (ac.callsign || 'BelugaXL'))}</span>
          </div>
          <span class="px-2 py-0.5 text-[9px] font-bold rounded ${isAirborne ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' : 'bg-slate-800 text-slate-300 border border-slate-700'}">
            ${escapeHTML(statusText)}
          </span>
        </div>
        <div class="text-[11px] text-slate-300">
          <p class="text-slate-400 text-[10px]">${escapeHTML(routeText)}</p>
          <p class="text-sky-400 font-medium mt-0.5">${escapeHTML(ac.component_payload || 'Componentes A320/A350')}</p>
        </div>
        <div class="pt-2 border-t border-slate-800/80 flex justify-between items-center text-[10px]">
          <span class="text-slate-500 font-mono">Tracking ADS-B</span>
          <a href="${safeRadarUrl}" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline font-mono flex items-center">
            Radar Live <i data-lucide="external-link" class="w-3 h-3 ml-1"></i>
          </a>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

export function renderBelugaRoutes(routes) {
  const routesGrid = document.getElementById('beluga-routes-grid');
  if (routesGrid && routes.length > 0) {
    routesGrid.innerHTML = routes.map(r => {
      const routeName = r.route || `${r.origin} ➔ ${r.destination}`;
      const isBlocked = (r.status && r.status.includes('Bloqueado')) || r.color === 'rose';
      return `
        <div class="p-3 bg-slate-900/80 border ${isBlocked ? 'border-rose-500/30' : 'border-slate-800'} rounded-xl space-y-1 hover:border-slate-700 transition">
          <div class="flex justify-between items-center text-xs">
            <span class="font-bold text-white font-mono">${escapeHTML(routeName)}</span>
            <span class="px-1.5 py-0.5 text-[9px] font-bold rounded ${isBlocked ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'}">
              ${escapeHTML(r.status || 'Activo')}
            </span>
          </div>
          <p class="text-[11px] text-slate-400">${escapeHTML(r.impact || r.notes || 'Transporte JIT')}</p>
          <span class="text-[10px] text-slate-500 block font-mono">Frecuencia: ${escapeHTML(r.frequency || 'N/A')}</span>
        </div>
      `;
    }).join('');
  }
}

export function renderBelugaCitations(citations) {
  const citationsContainer = document.getElementById('beluga-citations-container');
  if (citationsContainer && citations.length > 0) {
    citationsContainer.innerHTML = citations.map(c => `
      <div class="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1">
        <div class="flex justify-between items-center">
          <span class="text-[10px] font-bold text-sky-300 font-mono">${escapeHTML(c.title)}</span>
          <span class="text-[9px] text-slate-500 font-mono">Fuente Verificada</span>
        </div>
        <p class="text-[11px] text-slate-300 leading-relaxed">${escapeHTML(c.detail)}</p>
      </div>
    `).join('');
  }
}

export function renderBelugaMovements(movements) {
  const container = document.getElementById('beluga-movements-container');
  const countBadge = document.getElementById('movements-count-badge');
  if (!container) return;

  const rawMovements = Array.isArray(movements) ? movements : [];

  const filtered = selectedBelugaTail === 'ALL'
    ? rawMovements
    : rawMovements.filter(m => (m.registration && m.registration.toUpperCase() === selectedBelugaTail.toUpperCase()) || (m.name && m.name.toUpperCase().includes(selectedBelugaTail.toUpperCase())));

  if (countBadge) {
    countBadge.textContent = `${filtered.length} vuelos registrados`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-xl space-y-1.5">
        <p class="text-xs font-semibold text-slate-400">Sin movimientos recientes registrados para este criterio.</p>
        <p class="text-[11px] text-slate-500 font-mono">Filtro activo: ${escapeHTML(selectedBelugaTail)} | Todos los vuelos en tierra o bajo seguimiento.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(m => {
    const isEnVuelo = m.flight_status === 'En Vuelo';
    const isCanceled = m.flight_status && m.flight_status.includes('Cancelado');
    const isGetafe = m.is_spain_connection || m.origin_code === 'LEGT' || m.destination_code === 'LEGT';
    
    let statusBadgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
    if (isEnVuelo) {
      statusBadgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse';
    } else if (isCanceled) {
      statusBadgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-extrabold';
    } else if (m.flight_status === 'Completado') {
      statusBadgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }

    const corridor = `${m.origin_name || m.origin_code} (${m.origin_code}) ➔ ${m.destination_name || m.destination_code} (${m.destination_code})`;
    const depTimeFormatted = m.departure_time ? m.departure_time.replace('T', ' ').replace('Z', ' UTC') : 'N/A';

    return `
      <div class="p-3 bg-slate-900/80 border ${isGetafe ? 'border-rose-900/40 bg-rose-950/10' : 'border-slate-800'} rounded-xl space-y-2 hover:border-slate-700 transition shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-sky-400 rounded border border-slate-700">
              ${escapeHTML(m.registration || m.name || 'BelugaXL')}
            </span>
            <span class="text-xs font-bold text-white font-mono">${escapeHTML(m.callsign || 'N/A')}</span>
            <span class="text-[11px] text-slate-400 font-medium">(${escapeHTML(m.name || 'BelugaXL')})</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="px-2 py-0.5 text-[9px] font-bold rounded border ${statusBadgeClass}">
              ${escapeHTML(m.flight_status || 'Programado')}
            </span>
            ${isGetafe ? `
              <span class="px-2 py-0.5 text-[9px] font-extrabold bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded flex items-center gap-1">
                <i data-lucide="shield-alert" class="w-3 h-3 text-rose-400"></i> Veto Getafe
              </span>
            ` : ''}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
          <div>
            <div class="text-[10.5px] text-slate-400 flex items-center gap-1">
              <i data-lucide="navigation" class="w-3 h-3 text-sky-400"></i>
              <span class="font-semibold text-slate-300">Ruta:</span>
              <span class="font-mono text-white">${escapeHTML(corridor)}</span>
            </div>
            <div class="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
              <i data-lucide="clock" class="w-3 h-3 text-slate-500"></i>
              <span>Salida: ${escapeHTML(depTimeFormatted)}</span>
              ${m.duration_formatted ? `<span class="text-slate-400">(${escapeHTML(m.duration_formatted)})</span>` : ''}
            </div>
          </div>

          <div class="text-left md:text-right text-[10.5px]">
            <div class="text-slate-400">
              <span class="font-semibold text-slate-300">Carga:</span>
              <span class="text-amber-300 font-medium">${escapeHTML(m.component_payload || 'Componentes Aeronáuticos')}</span>
            </div>
            <div class="text-[10px] text-slate-500 mt-0.5">
              <span>Impacto: <strong class="${isGetafe ? 'text-rose-400' : 'text-sky-400'}">${escapeHTML(m.strike_relevance || 'Circulación Europea')}</strong></span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

export function startBelugaLivePolling() {
  if (belugaPollingInterval) clearInterval(belugaPollingInterval);

  // Setup Page Visibility listener to pause polling when tab is hidden
  if (!window._belugaVisibilityListenerBound) {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (belugaPollingInterval) {
          clearInterval(belugaPollingInterval);
          belugaPollingInterval = null;
        }
      } else {
        const currentTab = document.querySelector('.tab-content:not(.hidden)');
        if (currentTab && currentTab.id === 'tab-industrial') {
          startBelugaLivePolling();
        }
      }
    });
    window._belugaVisibilityListenerBound = true;
  }

  belugaPollingInterval = setInterval(async () => {
    await refreshBelugaLive(false);
  }, 30000);
}

export async function refreshBelugaLive(manualTrigger = false) {
  try {
    const res = await fetch('data/beluga_status.json', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (window.CONFLICT_DATA) {
        window.CONFLICT_DATA.beluga_logistics = data;
      }
      renderBelugaFleet(data.fleet || []);
      renderBelugaRoutes(data.routes || []);
      renderBelugaMovements(data.recent_movements || []);
      if (manualTrigger) showToast('Flota BelugaXL actualizada en tiempo real', 'radar');
    }
  } catch (e) {
    if (manualTrigger) showToast('Modo sin conexión: mostrando datos calibrados', 'info');
  }
}
