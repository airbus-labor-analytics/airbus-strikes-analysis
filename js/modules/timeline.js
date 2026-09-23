// ============================================================================
// dashboard/js/modules/timeline.js
// Module 5: Conflict Timeline & Factory Assembly Minutes Controller
// Airbus Spain 2026 Strike Strategic Analytics Dashboard
// ============================================================================

import { escapeHTML, sanitizeURL } from '../core.js';

let currentTimelinePlantFilter = 'ALL';
let currentTimelineActorFilter = 'ALL';
let currentTimelineSearchQuery = '';

export function getMadridDate() {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' });
    return formatter.format(new Date());
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

export function parseTimelineDate(dateStr) {
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
      description: 'No se encontraron registros de eventos en la base de datos.',
      actionRequired: true,
      deltaDays: 999
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
      headline: 'Fechas no parseables',
      description: 'No se pudo interpretar ninguna fecha del cronograma.',
      actionRequired: true,
      deltaDays: 999
    };
  }
  
  const dToday = new Date(todayMadrid + 'T00:00:00');
  const dLatest = new Date(latest.date + 'T00:00:00');
  const diffDays = Math.floor((dToday - dLatest) / (1000 * 60 * 60 * 24));
  const isWeekend = (dToday.getDay() === 0 || dToday.getDay() === 6);
  
  if (diffDays <= 0) {
    return {
      statusCode: 'UP_TO_DATE',
      badgeColor: 'emerald',
      headline: 'Cronología al Día: Novedades de hoy registradas',
      description: `Se han registrado los eventos correspondientes a la fecha actual (${latest.date}).`,
      actionRequired: false,
      deltaDays: 0,
      latestDate: latest.date
    };
  } else if (diffDays === 1) {
    return {
      statusCode: 'PENDING_TODAY',
      badgeColor: 'amber',
      headline: 'Novedades de Hoy Pendientes de Registro',
      description: `La última entrada registrada es del ${latest.date}. Pendiente sincronizar con los comunicados y asambleas de hoy (${todayMadrid}).`,
      actionRequired: true,
      deltaDays: 1,
      latestDate: latest.date
    };
  } else if (isWeekend && diffDays <= 2) {
    return {
      statusCode: 'WEEKEND_PAUSE',
      badgeColor: 'sky',
      headline: 'Pausa de Fin de Semana: Actividad Asamblearia Reducida',
      description: `Último registro del ${latest.date}. Servicios de guardia y piquetes activos.`,
      actionRequired: false,
      deltaDays: diffDays,
      latestDate: latest.date
    };
  } else {
    return {
      statusCode: 'STALE_ALERT',
      badgeColor: 'rose',
      headline: `Alerta de Desactualización: ${diffDays} días sin registros`,
      description: `El cronograma no registra eventos desde el ${latest.date}. Se requiere sincronización urgente con Telegram.`,
      actionRequired: true,
      deltaDays: diffDays,
      latestDate: latest.date
    };
  }
}

export function renderTimelineFreshnessBanner(timeline) {
  const container = document.getElementById('timeline-freshness-banner');
  if (!container) return;
  
  const status = evaluateTimelineFreshness(timeline);
  const colorMap = {
    emerald: {
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-950/20',
      badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: 'check-circle',
      iconColor: 'text-emerald-400'
    },
    amber: {
      border: 'border-amber-500/40',
      bg: 'bg-amber-950/20',
      badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      icon: 'clock',
      iconColor: 'text-amber-400'
    },
    sky: {
      border: 'border-sky-500/40',
      bg: 'bg-sky-950/20',
      badgeBg: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      icon: 'calendar',
      iconColor: 'text-sky-400'
    },
    rose: {
      border: 'border-rose-500/40',
      bg: 'bg-rose-950/20',
      badgeBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      icon: 'alert-triangle',
      iconColor: 'text-rose-400'
    }
  };
  
  const theme = colorMap[status.badgeColor] || colorMap.rose;
  
  container.className = `p-4 rounded-xl border ${theme.border} ${theme.bg} backdrop-blur-sm transition-all duration-300 mb-6`;
  container.innerHTML = `
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div class="flex items-start sm:items-center space-x-3">
        <div class="p-2 rounded-lg bg-slate-900/60 border border-slate-700/50 ${theme.iconColor} shrink-0">
          <i data-lucide="${theme.icon}" class="w-5 h-5"></i>
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${theme.badgeBg}">
              ${status.statusCode}
            </span>
            <h4 class="text-sm font-bold text-white">${escapeHTML(status.headline)}</h4>
          </div>
          <p class="text-xs text-slate-300 mt-1">${escapeHTML(status.description)}</p>
        </div>
      </div>
      <div class="flex items-center space-x-2 shrink-0 self-end sm:self-center">
        <a href="https://t.me/+MnuqJDCAAgYyMGQ0" target="_blank" rel="noopener noreferrer" 
           class="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-xs font-semibold flex items-center space-x-1.5 transition">
          <i data-lucide="send" class="w-3.5 h-3.5"></i>
          <span>Canal Telegram</span>
        </a>
        <button onclick="if(window.triggerManualSync) window.triggerManualSync();" 
                class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition">
          <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
          <span>Sincronizar</span>
        </button>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
}

export function updateHUDTimelineFreshness(timeline) {
  const hudElement = document.getElementById('hud-timeline-freshness');
  if (!hudElement) return;
  const status = evaluateTimelineFreshness(timeline);
  
  if (status.statusCode === 'UP_TO_DATE') {
    hudElement.className = 'px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center text-xs transition cursor-pointer';
    hudElement.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span><span>Cronología: <strong class="text-white">Al Día</strong></span>`;
  } else if (status.statusCode === 'PENDING_TODAY') {
    hudElement.className = 'px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold flex items-center text-xs transition cursor-pointer';
    hudElement.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 animate-ping"></span><span>Cronología: <strong class="text-white">Pendiente Hoy</strong></span>`;
  } else if (status.statusCode === 'WEEKEND_PAUSE') {
    hudElement.className = 'px-2.5 py-1 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 font-semibold flex items-center text-xs transition cursor-pointer';
    hudElement.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-sky-400 mr-1.5"></span><span>Cronología: <strong class="text-white">Guardia Finde</strong></span>`;
  } else {
    hudElement.className = 'px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold flex items-center text-xs transition cursor-pointer';
    hudElement.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5 animate-bounce"></span><span>Cronología: <strong class="text-white">${status.deltaDays}d Desfase</strong></span>`;
  }
}

export function setTimelineFilter(plant) {
  currentTimelinePlantFilter = plant || 'ALL';
  document.querySelectorAll('.timeline-filter-btn').forEach(btn => {
    if (btn.dataset.plant === currentTimelinePlantFilter) {
      btn.className = 'timeline-filter-btn px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow-sm transition cursor-pointer';
    } else {
      btn.className = 'timeline-filter-btn px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer';
    }
  });
  renderTimeline();
}

export function setTimelineActorFilter(actorCategory) {
  currentTimelineActorFilter = actorCategory || 'ALL';
  document.querySelectorAll('.timeline-actor-btn').forEach(btn => {
    if (btn.dataset.actor === currentTimelineActorFilter) {
      btn.className = 'timeline-actor-btn px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow-sm transition cursor-pointer';
    } else {
      btn.className = 'timeline-actor-btn px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer';
    }
  });
  renderTimeline();
}

export function setTimelineSearchQuery(query) {
  currentTimelineSearchQuery = (query || '').toLowerCase().trim();
  renderTimeline();
}

export function renderTimeline(timelineData) {
  const container = document.getElementById('timeline-container');
  if (!container) return;
  
  const timeline = timelineData || (window.CONFLICT_DATA ? window.CONFLICT_DATA.timeline : []);
  if (!timeline || timeline.length === 0) {
    container.innerHTML = `<div class="p-8 text-center text-slate-500 text-sm">No hay registros cronológicos disponibles.</div>`;
    return;
  }
  
  let filtered = timeline;
  
  // Filter by plant
  if (currentTimelinePlantFilter !== 'ALL') {
    filtered = filtered.filter(item => {
      if (item.site && item.site.toLowerCase().includes(currentTimelinePlantFilter.toLowerCase())) return true;
      if (item.location && item.location.toLowerCase().includes(currentTimelinePlantFilter.toLowerCase())) return true;
      if (item.per_plant_detail && Array.isArray(item.per_plant_detail)) {
        return item.per_plant_detail.some(p => p.plant && p.plant.toLowerCase().includes(currentTimelinePlantFilter.toLowerCase()));
      }
      return false;
    });
  }
  
  // Filter by actor category
  if (currentTimelineActorFilter !== 'ALL') {
    filtered = filtered.filter(item => {
      const cat = (item.actor_category || '').toLowerCase();
      return cat === currentTimelineActorFilter.toLowerCase();
    });
  }
  
  // Filter by search query
  if (currentTimelineSearchQuery) {
    filtered = filtered.filter(item => {
      const text = `${item.title || ''} ${item.phase || ''} ${item.summary || ''} ${item.location || ''} ${item.strategic_takeaway || ''}`.toLowerCase();
      return text.includes(currentTimelineSearchQuery);
    });
  }
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center glass-card rounded-xl border border-slate-800 text-slate-400">
        <i data-lucide="filter-x" class="w-8 h-8 text-slate-500 mx-auto mb-2"></i>
        <p class="font-semibold text-sm">No se encontraron hitos para los filtros seleccionados.</p>
        <p class="text-xs text-slate-500 mt-1">Prueba a seleccionar "Todas las Plantas" o limpiar el buscador.</p>
        <button onclick="window.setTimelineFilter('ALL'); window.setTimelineActorFilter('ALL'); const searchInput = document.getElementById('timeline-search-input'); if(searchInput) { searchInput.value=''; window.setTimelineSearchQuery(''); }" class="mt-3 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs font-semibold transition">
          Restablecer Filtros
        </button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }
  
  container.innerHTML = filtered.map(item => {
    const badgeColor = item.badge_color || 'blue';
    const colorClasses = {
      rose: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
      emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
      amber: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
      sky: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
      purple: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
      blue: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
      slate: 'border-slate-500/30 bg-slate-500/10 text-slate-400'
    }[badgeColor] || 'border-blue-500/30 bg-blue-500/10 text-blue-400';
    
    // Render per-plant detail table if available
    let plantDetailsHTML = '';
    if (item.per_plant_detail && Array.isArray(item.per_plant_detail) && item.per_plant_detail.length > 0) {
      plantDetailsHTML = `
        <div class="mt-3.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div class="text-[11px] font-bold text-slate-300 flex items-center justify-between">
            <span class="flex items-center space-x-1.5">
              <i data-lucide="building-2" class="w-3.5 h-3.5 text-blue-400"></i>
              <span>Desglose por Factoría / Asamblea:</span>
            </span>
            <span class="text-[10px] text-slate-500 font-mono">${item.per_plant_detail.length} centros</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            ${item.per_plant_detail.map(p => `
              <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-2">
                <div>
                  <span class="font-bold text-slate-200 block">${escapeHTML(p.plant || '')}</span>
                  <span class="text-[11px] text-slate-400">${escapeHTML(p.votes || p.result || '')}</span>
                </div>
                <div class="text-right shrink-0">
                  ${p.time ? `<span class="text-[10px] font-mono text-slate-500 block">${escapeHTML(p.time)}</span>` : ''}
                  ${p.attendees ? `<span class="text-[10px] font-semibold text-emerald-400 block">${escapeHTML(p.attendees)} trab.</span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    // Render 11 points list if available
    let elevenPointsHTML = '';
    if (item.eleven_points_detail && Array.isArray(item.eleven_points_detail)) {
      elevenPointsHTML = `
        <div class="mt-3.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
          <div class="font-bold text-emerald-400 text-xs flex items-center space-x-1.5 mb-1">
            <i data-lucide="list-ordered" class="w-3.5 h-3.5"></i>
            <span>Plataforma Oficial de 11 Puntos Entregada en SIMA:</span>
          </div>
          <ol class="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
            ${item.eleven_points_detail.map(pt => `<li>${escapeHTML(pt)}</li>`).join('')}
          </ol>
        </div>
      `;
    }
    
    // Document button
    let docBtnHTML = '';
    if (item.document_id || item.source_url) {
      const docTarget = item.document_id || item.source_url;
      docBtnHTML = `
        <button onclick="if(window.openSourceModal) window.openSourceModal('${escapeHTML(docTarget)}');" 
                class="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-[11px] font-semibold flex items-center space-x-1 transition cursor-pointer">
          <i data-lucide="file-text" class="w-3 h-3"></i>
          <span>Ver Minuta Íntegra</span>
        </button>
      `;
    }
    
    return `
      <div class="relative group">
        <!-- Dot on timeline -->
        <div class="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-${badgeColor}-500 shadow-lg shadow-${badgeColor}-500/30"></div>
        
        <div class="glass-card p-4 sm:p-5 rounded-2xl border-slate-800 group-hover:border-slate-700 transition space-y-3">
          <!-- Header info -->
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-black text-white font-mono bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">${escapeHTML(item.date)}</span>
              <span class="text-xs text-slate-400 font-medium">${escapeHTML(item.phase || '')}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold border ${colorClasses}">
                ${escapeHTML(item.badge || '')}
              </span>
              ${item.verified ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1"><i data-lucide="shield-check" class="w-2.5 h-2.5 mr-0.5"></i>Verificado</span>` : ''}
            </div>
          </div>
          
          <!-- Title -->
          <h3 class="text-base font-bold text-white tracking-tight">${escapeHTML(item.title)}</h3>
          
          <!-- Metadata strip (Location, Time, Attendees) -->
          <div class="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
            ${item.location ? `
              <div class="flex items-center space-x-1">
                <i data-lucide="map-pin" class="w-3.5 h-3.5 text-rose-400"></i>
                <span class="text-slate-300 font-medium">${escapeHTML(item.location)}</span>
              </div>
            ` : ''}
            ${item.time ? `
              <div class="flex items-center space-x-1 font-mono">
                <i data-lucide="clock" class="w-3.5 h-3.5 text-amber-400"></i>
                <span class="text-slate-400">${escapeHTML(item.time)}</span>
              </div>
            ` : ''}
            ${item.census_and_votes ? `
              <div class="flex items-center space-x-1 w-full mt-1 sm:mt-0 sm:w-auto">
                <i data-lucide="users" class="w-3.5 h-3.5 text-blue-400 shrink-0"></i>
                <span class="text-slate-300 text-[11px]">${escapeHTML(item.census_and_votes)}</span>
              </div>
            ` : ''}
          </div>
          
          <!-- Summary text -->
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">${escapeHTML(item.summary || '')}</p>
          
          <!-- Custom plant details / 11 points -->
          ${plantDetailsHTML}
          ${elevenPointsHTML}
          
          <!-- Strategic takeaway box -->
          ${item.strategic_takeaway ? `
            <div class="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-[11px] text-slate-300 flex items-start space-x-2">
              <i data-lucide="zap" class="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5"></i>
              <div>
                <strong class="text-amber-400">Lección Estratégica:</strong>
                <span>${escapeHTML(item.strategic_takeaway)}</span>
              </div>
            </div>
          ` : ''}
          
          <!-- Footer actions: Actors & Source Link -->
          <div class="flex flex-col sm:flex-row justify-between sm:items-center pt-2 border-t border-slate-800/60 gap-2">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Actores:</span>
              ${(item.actors || []).slice(0, 3).map(a => `
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800/80 text-slate-300 border border-slate-700/60">${escapeHTML(a)}</span>
              `).join('')}
              ${(item.actors || []).length > 3 ? `<span class="text-[10px] text-slate-500 font-mono">+${(item.actors || []).length - 3} más</span>` : ''}
            </div>
            
            <div class="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
              ${item.source_ref ? `
                <span class="text-[10px] font-mono text-slate-500 hidden md:inline-block max-w-[200px] truncate" title="${escapeHTML(item.source_ref)}">
                  ${escapeHTML(item.source_ref)}
                </span>
              ` : ''}
              ${docBtnHTML}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  if (window.lucide) lucide.createIcons();
}

export function initTimeline() {
  const timeline = window.CONFLICT_DATA ? window.CONFLICT_DATA.timeline : [];
  renderTimelineFreshnessBanner(timeline);
  updateHUDTimelineFreshness(timeline);
  renderTimeline(timeline);
}
