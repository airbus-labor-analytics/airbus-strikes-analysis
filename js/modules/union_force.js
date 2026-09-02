// ============================================================================
// dashboard/js/modules/union_force.js
// Module 4: Union Representation, 198 Delegates, 24-J Referendum & Workflows
// ============================================================================

import { escapeHTML, formatNumber, formatPct } from '../core.js';

export let currentSelectedSite = 'all';
export let siteDelegatesChart = null;
export let referendumPieChart = null;
export let referendumSitesChart = null;
export let unionShareChart = null;
export let unionEvolutionChart = null;

// ==================== 1. UNION CENSUS & DELEGATES ====================

export function initUnionCensusAndDelegates() {
  const unionData = window.CONFLICT_DATA?.union_representation;
  if (!unionData) return;

  const sites = unionData.plant_census_and_delegates || [];
  const btnContainer = document.getElementById('union-site-filter-buttons');
  const detailsContainer = document.getElementById('union-site-details-container');

  if (btnContainer && sites.length > 0) {
    btnContainer.innerHTML = `
      <button type="button" onclick="selectUnionSite('all')" id="btn-site-all" class="px-2.5 py-1 text-xs font-bold rounded-lg border transition ${currentSelectedSite === 'all' ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'}">
        Todos los Centros (${sites.length})
      </button>
      ${sites.map(s => `
        <button type="button" onclick="selectUnionSite('${escapeHTML(s.site_id)}')" id="btn-site-${escapeHTML(s.site_id)}" class="px-2.5 py-1 text-xs font-medium rounded-lg border transition ${currentSelectedSite === s.site_id ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'}">
          ${escapeHTML(s.name)}
        </button>
      `).join('')}
    `;
  }

  renderUnionSiteDetails(sites);
  initSiteDelegatesChart(sites);
}

export function selectUnionSite(siteId) {
  currentSelectedSite = siteId;

  document.querySelectorAll('#union-site-filter-buttons button').forEach(btn => {
    btn.classList.remove('bg-rose-600', 'text-white', 'border-rose-500', 'shadow-md', 'shadow-rose-600/30', 'font-bold');
    btn.classList.add('bg-slate-900', 'text-slate-400', 'border-slate-800', 'font-medium');
  });

  const activeBtn = document.getElementById(`btn-site-${siteId}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-slate-900', 'text-slate-400', 'border-slate-800', 'font-medium');
    activeBtn.classList.add('bg-rose-600', 'text-white', 'border-rose-500', 'shadow-md', 'shadow-rose-600/30', 'font-bold');
  }

  const sites = window.CONFLICT_DATA?.union_representation?.plant_census_and_delegates || [];
  renderUnionSiteDetails(sites);
}

export function renderUnionSiteDetails(sites) {
  const detailsContainer = document.getElementById('union-site-details-container');
  if (!detailsContainer) return;

  const filteredSites = currentSelectedSite === 'all' 
    ? sites 
    : sites.filter(s => s.site_id === currentSelectedSite);

  const unionColors = {
    "SIPA": { bg: "bg-sky-500", text: "text-sky-400", border: "border-sky-500/30" },
    "CCOO": { bg: "bg-red-500", text: "text-red-400", border: "border-red-500/30" },
    "UGT": { bg: "bg-orange-500", text: "text-orange-400", border: "border-orange-500/30" },
    "ATP": { bg: "bg-purple-500", text: "text-purple-400", border: "border-purple-500/30" },
    "CGT": { bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/30" },
    "UTIL": { bg: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/30" }
  };

  detailsContainer.innerHTML = filteredSites.map(site => {
    const totalDels = site.total_delegates || 1;
    const dels = site.delegates_by_union || {};
    const ref = site.referendum_24j || {};

    return `
      <div class="p-4 sm:p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4 hover:border-slate-700 transition">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-3">
          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-sm sm:text-base font-black text-white">${escapeHTML(site.name)}</h4>
              <span class="px-2 py-0.5 text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded">
                ${site.census.toLocaleString()} trabajadores
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">${escapeHTML(site.role)}</p>
          </div>
          <div class="flex items-center gap-2 self-start sm:self-auto">
            <span class="px-2.5 py-1 text-xs font-black bg-slate-800 text-slate-200 border border-slate-700 rounded-lg">
              ${site.total_delegates} Delegados de Centro
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2.5">
            <div class="flex justify-between items-center text-xs font-bold text-slate-300">
              <span>Distribución de Delegados Electos</span>
              <span class="text-[10px] text-slate-500">Elecciones Sindicales</span>
            </div>
            <div class="space-y-2">
              ${Object.entries(dels).map(([uCode, count]) => {
                const pct = ((count / totalDels) * 100).toFixed(1);
                const color = unionColors[uCode] || { bg: "bg-sky-500", text: "text-sky-400", border: "border-sky-500/30" };
                return `
                  <div>
                    <div class="flex justify-between items-center text-xs mb-1">
                      <span class="font-bold ${color.text}">${escapeHTML(uCode)}</span>
                      <span class="font-mono text-slate-300 text-[11px]">${count} del. (${pct}%)</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div class="${color.bg} h-1.5 rounded-full" style="width: ${pct}%"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2.5">
            <div class="flex justify-between items-center text-xs font-bold text-slate-300">
              <span>Resultado Referéndum 24-J</span>
              <span class="text-[10px] text-sky-400 font-mono">Participación: ${ref.turnout_pct || '81.4'}%</span>
            </div>
            <div class="grid grid-cols-3 gap-2 text-center text-xs">
              <div class="p-2 bg-rose-950/30 border border-rose-500/20 rounded-lg">
                <span class="text-[10px] text-rose-400 font-bold block">NO</span>
                <span class="text-sm font-black text-white font-mono">${ref.no_votes || 0}</span>
                <span class="text-[9px] text-slate-400 block font-mono">(${ref.no_pct || 0}%)</span>
              </div>
              <div class="p-2 bg-emerald-950/30 border border-emerald-500/20 rounded-lg">
                <span class="text-[10px] text-emerald-400 font-bold block">SÍ</span>
                <span class="text-sm font-black text-white font-mono">${ref.yes_votes || 0}</span>
                <span class="text-[9px] text-slate-400 block font-mono">(${ref.yes_pct || 0}%)</span>
              </div>
              <div class="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                <span class="text-[10px] text-slate-400 font-bold block">BLANCO</span>
                <span class="text-sm font-black text-white font-mono">${ref.blank_votes || 0}</span>
                <span class="text-[9px] text-slate-500 block font-mono">(${ref.blank_pct || 0}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

export function initSiteDelegatesChart(sites) {
  const ctx = document.getElementById('siteDelegatesChart');
  if (!ctx || !sites || sites.length === 0) return;

  if (siteDelegatesChart) {
    siteDelegatesChart.destroy();
  }

  siteDelegatesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sites.map(s => s.name),
      datasets: [
        {
          label: 'Delegados Totales',
          data: sites.map(s => s.total_delegates),
          backgroundColor: '#3b82f6',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { family: 'Geist Mono', size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8', font: { family: 'Geist Mono', size: 10 } }
        }
      }
    }
  });

  window.chartRegistry = window.chartRegistry || {};
  window.chartRegistry['siteDelegatesChart'] = siteDelegatesChart;
}

// ==================== 2. REFERENDUM 24-J AUDIT ====================

export function initReferendumAudit() {
  initReferendumPieChart();
  initReferendumSitesChart();
}

export function initReferendumPieChart() {
  const ctx = document.getElementById('referendumPieChart');
  if (!ctx) return;

  if (referendumPieChart) {
    referendumPieChart.destroy();
  }

  referendumPieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['NO (Rechazo Huelga)', 'SÍ (Aceptación)', 'Blanco / Nulo'],
      datasets: [
        {
          data: [49.15, 46.24, 4.62],
          backgroundColor: ['#f43f5e', '#10b981', '#64748b'],
          borderColor: '#000000',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#cbd5e1', font: { family: 'Geist Mono', size: 11 } }
        }
      },
      cutout: '65%'
    }
  });

  window.chartRegistry = window.chartRegistry || {};
  window.chartRegistry['referendumPieChart'] = referendumPieChart;
}

export function initReferendumSitesChart() {
  const ctx = document.getElementById('referendumSitesChart');
  if (!ctx) return;

  if (referendumSitesChart) {
    referendumSitesChart.destroy();
  }

  const sites = window.CONFLICT_DATA?.union_representation?.plant_census_and_delegates || [];

  referendumSitesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sites.map(s => s.name),
      datasets: [
        {
          label: '% Voto NO',
          data: sites.map(s => s.referendum_24j?.no_pct || 50),
          backgroundColor: '#f43f5e',
          borderRadius: 4
        },
        {
          label: '% Voto SÍ',
          data: sites.map(s => s.referendum_24j?.yes_pct || 45),
          backgroundColor: '#10b981',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#cbd5e1', font: { family: 'Geist Mono', size: 10 } }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { family: 'Geist Mono', size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: {
            color: '#94a3b8',
            font: { family: 'Geist Mono', size: 10 },
            callback: v => `${v}%`
          }
        }
      }
    }
  });

  window.chartRegistry = window.chartRegistry || {};
  window.chartRegistry['referendumSitesChart'] = referendumSitesChart;
}

// ==================== 3. UNION SECTIONS & HISTORICAL EVOLUTION ====================

export function initUnionSections() {
  initUnionEvolutionChart();
}

export function initUnionEvolutionChart() {
  const ctx = document.getElementById('unionEvolutionChart');
  if (!ctx) return;

  if (unionEvolutionChart) {
    unionEvolutionChart.destroy();
  }

  const years = ['2015', '2019', '2023', '2026'];

  unionEvolutionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [
        { label: 'CCOO', data: [85, 80, 78, 76], borderColor: '#ef4444', borderWidth: 2, tension: 0.2 },
        { label: 'UGT', data: [45, 42, 38, 36], borderColor: '#f97316', borderWidth: 2, tension: 0.2 },
        { label: 'ATP', data: [25, 28, 30, 31], borderColor: '#a855f7', borderWidth: 2, tension: 0.2 },
        { label: 'SIPA', data: [20, 24, 28, 30], borderColor: '#0ea5e9', borderWidth: 2, tension: 0.2 },
        { label: 'CGT', data: [18, 20, 22, 25], borderColor: '#10b981', borderWidth: 2, tension: 0.2 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#cbd5e1', font: { family: 'Geist Mono', size: 10.5 } }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { family: 'Geist Mono', size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8', font: { family: 'Geist Mono', size: 10 } }
        }
      }
    }
  });

  window.chartRegistry = window.chartRegistry || {};
  window.chartRegistry['unionEvolutionChart'] = unionEvolutionChart;
}

// ==================== 4. INITIALIZATION ====================
export function initUnionForce() {
  renderDelegatesTable();
  initSiteDelegatesChart();
  initUnionShareChart();
  initReferendumCharts();
  initUnionEvolutionChart();
}
