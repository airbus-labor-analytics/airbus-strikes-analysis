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

// ==================== 4. ASSEMBLY TIMELINE & MINUTES ====================
let currentTimelinePlantFilter = 'ALL';
let currentTimelineActorFilter = 'ALL';

function getMadridDate() {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' });
    return formatter.format(new Date());
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

function parseTimelineDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  let clean = dateStr.toLowerCase().replace(/\(hoy\)/g, '').trim();
  
  const rangeMatch = clean.match(/^(\d{4})\s*[-–—]\s*(\d{4})/);
  if (rangeMatch) return `${rangeMatch[1]}-01-01`;
  
  const isoMatch = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
  }
  
  const months = {
    'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
    'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
    'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
  };
  
  const textMatch = clean.match(/(\d{1,2})\s+de\s+([a-záéíóú]+)(?:\s+de\s+(\d{4}))?/);
  if (textMatch) {
    const day = textMatch[1].padStart(2, '0');
    const month = months[textMatch[2]] || '01';
    const year = textMatch[3] || '2026';
    return `${year}-${month}-${day}`;
  }
  
  return null;
}

export function evaluateTimelineFreshness(timeline) {
  const todayMadrid = getMadridDate();
  if (!timeline || timeline.length === 0) {
    return {
      statusCode: 'STALE_ALERT',
      badgeColor: 'rose',
      headline: 'Sin datos en cronología',
      description: 'No se encontraron registros de eventos.',
      actionRequired: true
    };
  }
  
  const parsed = [];
  timeline.forEach(item => {
    const d = item.iso_date || parseTimelineDate(item.date);
    if (d) parsed.push({ date: d, item });
  });
  
  parsed.sort((a, b) => a.date.localeCompare(b.date));
  const latest = parsed[parsed.length - 1];
  
  if (!latest) {
    return {
      statusCode: 'STALE_ALERT',
      badgeColor: 'rose',
      headline: 'Sin fechas válidas',
      description: 'No se pudieron procesar las fechas de la cronología.',
      actionRequired: true
    };
  }
  
  const todayObj = new Date(todayMadrid);
  const latestObj = new Date(latest.date);
  const diffTime = todayObj.getTime() - latestObj.getTime();
  const daysDelta = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const isWeekend = todayObj.getDay() === 0 || todayObj.getDay() === 6;
  
  let statusCode = 'UP_TO_DATE';
  let badgeColor = 'emerald';
  let headline = 'Cronología al Día: Novedades de hoy registradas';
  let description = `Se han registrado los eventos y asambleas correspondientes a hoy (${todayMadrid.split('-').reverse().join('/')}).`;
  let actionRequired = false;
  
  if (daysDelta <= 0) {
    statusCode = 'UP_TO_DATE';
    badgeColor = 'emerald';
  } else if (daysDelta === 1 && !isWeekend) {
    statusCode = 'PENDING_TODAY';
    badgeColor = 'amber';
    headline = '⚠️ Novedades de Hoy Pendientes de Registro';
    description = `La última entrada registrada es del ${latest.date.split('-').reverse().join('/')}. Pendiente incorporar las asambleas y comunicados de hoy (${todayMadrid.split('-').reverse().join('/')}).`;
    actionRequired = true;
  } else if (isWeekend && daysDelta <= 2) {
    statusCode = 'WEEKEND_PAUSE';
    badgeColor = 'sky';
    headline = '🔵 Fin de Semana / Pausa de Negociación';
    description = `Última actividad registrada el ${latest.date.split('-').reverse().join('/')}. Fin de semana sin asambleas generales ordinarias.`;
  } else {
    statusCode = 'STALE_ALERT';
    badgeColor = 'rose';
    headline = `🚨 Alerta de Desactualización (${daysDelta} días sin registrar)`;
    description = `La cronología no registra actividad desde el ${latest.date.split('-').reverse().join('/')}. Requiere sincronización urgente con fuentes de Telegram y notas sindicales.`;
    actionRequired = true;
  }
  
  return {
    statusCode,
    badgeColor,
    headline,
    description,
    daysDelta,
    todayMadrid,
    latestDate: latest.date,
    latestItem: latest.item,
    actionRequired
  };
}

export function renderTimelineFreshnessBanner(freshness) {
  const banner = document.getElementById('timeline-freshness-banner');
  if (!banner) return;
  
  const colorClasses = {
    emerald: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300',
    amber: 'bg-amber-950/40 border-amber-500/40 text-amber-300',
    rose: 'bg-rose-950/40 border-rose-500/40 text-rose-300',
    sky: 'bg-sky-950/40 border-sky-500/40 text-sky-300'
  };
  
  const iconMap = {
    emerald: 'check-circle-2',
    amber: 'alert-triangle',
    rose: 'alert-octagon',
    sky: 'calendar'
  };
  
  const cls = colorClasses[freshness.badgeColor] || colorClasses.emerald;
  const icon = iconMap[freshness.badgeColor] || 'info';
  
  banner.innerHTML = `
    <div class="p-4 rounded-xl border ${cls} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
      <div class="flex items-start space-x-3">
        <i data-lucide="${icon}" class="w-5 h-5 mt-0.5 shrink-0"></i>
        <div>
          <h4 class="text-xs sm:text-sm font-bold text-white">${escapeHTML(freshness.headline)}</h4>
          <p class="text-xs text-slate-300 mt-0.5">${escapeHTML(freshness.description)}</p>
        </div>
      </div>
      <div class="flex items-center space-x-2 self-end sm:self-auto shrink-0">
        ${freshness.actionRequired ? `
          <button onclick="window.switchTab('evidence')" class="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
            <i data-lucide="send" class="w-3.5 h-3.5"></i>
            Ver Telegram
          </button>
          <button onclick="window.triggerManualSync()" class="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
            Sincronizar
          </button>
        ` : `
          <span class="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-bold">
            Zona Madrid: ${freshness.todayMadrid}
          </span>
        `}
      </div>
    </div>
  `;
}

export function initAssemblyTimeline() {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  const timeline = window.CONFLICT_DATA?.timeline || [];
  if (timeline.length === 0) return;

  const freshness = evaluateTimelineFreshness(timeline);
  renderTimelineFreshnessBanner(freshness);

  const filtered = timeline.filter(item => {
    if (currentTimelinePlantFilter !== 'ALL') {
      const itemPlant = (item.site || item.location || '').toLowerCase();
      const targetPlant = currentTimelinePlantFilter.toLowerCase();
      const plantMatches = itemPlant.includes(targetPlant) || 
        (item.per_plant_detail || []).some(p => (p.plant || '').toLowerCase().includes(targetPlant));
      if (!plantMatches) return false;
    }
    
    if (currentTimelineActorFilter !== 'ALL') {
      const itemCat = (item.actor_category || '').toLowerCase();
      const itemActors = (item.actors || []).map(a => a.toLowerCase()).join(' ');
      const itemActor = (item.actor || '').toLowerCase();
      
      if (currentTimelineActorFilter === 'assembly') {
        if (itemCat !== 'assembly' && !itemActor.includes('asamblea') && !itemActors.includes('asamblea')) return false;
      } else if (currentTimelineActorFilter === 'sima') {
        if (itemCat !== 'sima' && !itemActor.includes('sima') && !itemActors.includes('sima') && !(item.id || '').includes('sima')) return false;
      } else if (currentTimelineActorFilter === 'union') {
        if (itemCat !== 'union' && !itemActor.includes('sipa') && !itemActor.includes('ccoo') && !itemActor.includes('ugt') && !itemActor.includes('cgt') && !itemActors.includes('comité de huelga')) return false;
      } else if (currentTimelineActorFilter === 'company') {
        if (itemCat !== 'company' && !itemActor.includes('empresa') && !itemActor.includes('airbus se') && !itemActor.includes('patronal')) return false;
      }
    }
    
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
        <i data-lucide="filter-x" class="w-8 h-8 text-slate-500 mx-auto"></i>
        <p class="text-sm font-bold text-slate-300">No hay eventos para el filtro seleccionado</p>
        <p class="text-xs text-slate-500">Prueba cambiando la factoría o el ámbito en los botones superiores.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="relative group">
      <div class="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-${escapeHTML(item.badge_color || 'blue')}-500 shadow-lg shadow-${escapeHTML(item.badge_color || 'blue')}-500/30"></div>

      <div class="bg-slate-900/80 border border-slate-800 group-hover:border-slate-700 p-4 sm:p-5 rounded-2xl transition space-y-3.5">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-black text-white font-mono bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">${escapeHTML(item.date)}</span>
            <span class="text-xs text-slate-400 font-medium">• ${escapeHTML(item.phase || 'Conflicto')}</span>
            ${item.time ? `<span class="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded">🕒 ${escapeHTML(item.time)}</span>` : ''}
            ${item.site ? `<span class="text-[10px] font-mono text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">📍 ${escapeHTML(item.site)}</span>` : ''}
          </div>
          <span class="px-2 py-0.5 text-[10px] font-extrabold rounded bg-${escapeHTML(item.badge_color || 'blue')}-500/20 text-${escapeHTML(item.badge_color || 'blue')}-400 border border-${escapeHTML(item.badge_color || 'blue')}-500/30 self-start sm:self-auto">
            ${escapeHTML(item.badge || 'Registro')}
          </span>
        </div>

        <div>
          <h3 class="text-sm sm:text-base font-bold text-white">${escapeHTML(item.title)}</h3>
          ${item.location ? `
            <div class="flex items-center text-xs text-sky-400 mt-1 space-x-1.5">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 text-sky-400 shrink-0"></i>
              <span class="font-medium">${escapeHTML(item.location)}</span>
            </div>
          ` : ''}
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">${escapeHTML(item.summary)}</p>

        ${item.per_plant_detail ? `
          <div class="p-3 bg-slate-950/90 border border-slate-800/80 rounded-xl space-y-2">
            <div class="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="building-2" class="w-3.5 h-3.5 text-amber-400"></i> Desglose por Factorías y Votaciones:
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              ${item.per_plant_detail.map(p => `
                <div class="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center text-[11px]">
                  <span class="font-bold text-slate-200">${escapeHTML(p.plant)}</span>
                  <span class="text-emerald-400 font-mono">${escapeHTML(p.votes || p.attendees || '')}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${item.census_and_votes ? `
          <div class="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start space-x-2 text-xs">
            <i data-lucide="vote" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
            <div>
              <span class="font-bold text-emerald-400 text-[11px] uppercase tracking-wider block">Censo, Votación & Quórum:</span>
              <span class="text-slate-300 font-mono text-[11px]">${escapeHTML(item.census_and_votes)}</span>
            </div>
          </div>
        ` : ''}

        <div class="flex flex-wrap items-center gap-1.5 pt-1">
          ${(item.actors || []).map(a => `<span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">${escapeHTML(a)}</span>`).join('')}
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Doc: ${escapeHTML(item.source_ref || 'Archivo Oficial')}</span>
          ${(item.document_id || item.source_url) ? `
            <button onclick="window.openSourceModal('${escapeHTML(item.document_id || item.id)}')" class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/50 transition flex items-center gap-1 cursor-pointer">
              <i data-lucide="file-text" class="w-3 h-3 text-blue-400"></i>
              Ver Minuta Íntegra
            </button>
          ` : ''}
        </div>

        ${item.strategic_takeaway ? `
          <div class="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-[11px] text-slate-300">
            <strong class="text-amber-400">Lección Estratégica:</strong> ${escapeHTML(item.strategic_takeaway)}
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

// ==================== 5. DECISION TREES & WORKFLOWS ====================

export function initWorkflows() {
  const container = document.getElementById('workflows-container');
  if (!container) return;

  const workflows = window.CONFLICT_DATA?.workflows || [];
  if (workflows.length === 0) return;

  container.innerHTML = workflows.map(wf => `
    <div class="p-5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl transition space-y-4 shadow-xl">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800/80 pb-3">
        <div class="flex items-center space-x-2.5">
          <span class="px-2.5 py-1 rounded-lg text-xs font-black bg-${escapeHTML(wf.color || 'indigo')}-500/20 text-${escapeHTML(wf.color || 'indigo')}-300 border border-${escapeHTML(wf.color || 'indigo')}-500/40">${escapeHTML(wf.badge)}</span>
          <h3 class="text-sm sm:text-base font-bold text-white">${escapeHTML(wf.title)}</h3>
        </div>
        <span class="text-[11px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">${escapeHTML(wf.category || 'Protocolo')}</span>
      </div>

      <p class="text-xs text-slate-300 leading-relaxed">${escapeHTML(wf.description || wf.objective || '')}</p>

      <div class="space-y-2">
        ${(wf.steps || []).map(step => `
          <div class="p-2.5 bg-slate-950/60 border border-slate-800/60 rounded-xl flex items-start space-x-2.5 text-xs">
            <span class="w-5 h-5 rounded-full bg-slate-800 text-sky-400 font-mono font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">${step.step_num || '•'}</span>
            <div class="space-y-0.5">
              <span class="font-bold text-slate-200 block">${escapeHTML(step.label || step.action || '')}</span>
              <p class="text-slate-400 text-[11px] leading-relaxed">${escapeHTML(step.detail || step.consequence || '')}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}
