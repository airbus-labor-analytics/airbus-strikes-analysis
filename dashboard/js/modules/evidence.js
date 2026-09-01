// ============================================================================
// dashboard/js/modules/evidence.js
// Module 5: Strategic Evidence, Reputation Thermometer, Media Feed & Sources
// ============================================================================

import { escapeHTML, sanitizeURL, showToast, debounce } from '../core.js';

export let selectedThermoCategory = 'ALL';
export let selectedThermoPlatform = 'ALL';
export let selectedSourceCategory = 'ALL';
export let currentTgCategory = 'ALL';

// ==================== 1. PRESSURE THERMOMETER & MEDIA FEED ====================

export function initThermometer() {
  const thermo = window.CONFLICT_DATA?.sentiment_thermometer;
  if (!thermo) return;

  const tempEl = document.getElementById('thermo-temp');
  const badgeEl = document.getElementById('thermo-badge');
  const barEl = document.getElementById('thermo-bar');
  const descEl = document.getElementById('thermo-desc');
  const badEl = document.getElementById('thermo-bad-ratio');
  const goodEl = document.getElementById('thermo-good-ratio');

  if (tempEl) tempEl.textContent = `${thermo.temperature_celsius}°C`;
  if (badgeEl) badgeEl.textContent = thermo.status_label;
  if (descEl) descEl.textContent = thermo.description;
  if (barEl) barEl.style.width = `${thermo.temperature_celsius}%`;

  if (badEl) badEl.textContent = `${thermo.bad_for_airbus_percentage.toFixed(1)}%`;
  if (goodEl) goodEl.textContent = `${thermo.good_for_airbus_percentage.toFixed(1)}%`;

  const feedData = thermo.feed || [];
  renderThermoFeed(feedData);
}

export function filterThermoFeed(category) {
  selectedThermoCategory = category;

  ['all', 'bad', 'good'].forEach(id => {
    const btn = document.getElementById(`btn-feed-${id}`);
    if (btn) {
      btn.classList.remove('bg-blue-600', 'text-white');
      btn.classList.add('bg-slate-900', 'text-slate-300');
    }
  });

  const activeId = category === 'ALL' ? 'all' : (category === 'BAD_FOR_AIRBUS' ? 'bad' : 'good');
  const activeBtn = document.getElementById(`btn-feed-${activeId}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-slate-900', 'text-slate-300');
    activeBtn.classList.add(category === 'BAD_FOR_AIRBUS' ? 'bg-rose-600' : (category === 'GOOD_FOR_AIRBUS' ? 'bg-emerald-600' : 'bg-blue-600'), 'text-white');
  }

  const thermoFeedData = window.CONFLICT_DATA?.sentiment_thermometer?.feed || [];
  renderThermoFeed(thermoFeedData);
}

export function filterThermoPlatform(platform) {
  selectedThermoPlatform = platform;

  document.querySelectorAll('.feed-plat-pill').forEach(btn => {
    btn.classList.remove('bg-blue-600', 'text-white', 'font-bold');
    btn.classList.add('bg-slate-900', 'text-slate-300', 'font-medium');
  });

  const activeBtn = document.querySelector(`.feed-plat-pill[data-platform="${platform}"]`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-slate-900', 'text-slate-300', 'font-medium');
    activeBtn.classList.add('bg-blue-600', 'text-white', 'font-bold');
  }

  const thermoFeedData = window.CONFLICT_DATA?.sentiment_thermometer?.feed || [];
  renderThermoFeed(thermoFeedData);
}

export function renderThermoFeed(feed) {
  const container = document.getElementById('thermo-feed-container');
  const countBadge = document.getElementById('thermo-feed-count-badge');
  if (!container) return;

  const rawFeed = Array.isArray(feed) ? feed : [];

  let filtered = rawFeed;
  if (selectedThermoCategory !== 'ALL') {
    filtered = filtered.filter(i => i.category === selectedThermoCategory || i.impact === selectedThermoCategory);
  }

  if (selectedThermoPlatform !== 'ALL') {
    filtered = filtered.filter(i => {
      const p = (i.platform || '').toUpperCase();
      const s = (i.source || '').toUpperCase();
      if (selectedThermoPlatform === 'TWITTER') return p === 'TWITTER' || s.includes('TWITTER') || s.includes('@');
      if (selectedThermoPlatform === 'REDDIT') return p === 'REDDIT' || s.includes('REDDIT') || s.includes('R/');
      if (selectedThermoPlatform === 'THREADS') return p === 'THREADS' || s.includes('THREADS');
      if (selectedThermoPlatform === 'TELEGRAM') return p === 'TELEGRAM' || s.includes('TELEGRAM');
      if (selectedThermoPlatform === 'PRENSA') return p === 'PRENSA' || (!p && !s.includes('TWITTER') && !s.includes('REDDIT'));
      return true;
    });
  }

  if (countBadge) {
    countBadge.textContent = `${filtered.length} publicaciones`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-xl space-y-1.5">
        <p class="text-xs font-semibold text-slate-400">No se encontraron publicaciones con los filtros seleccionados.</p>
        <p class="text-[11px] text-slate-500 font-mono">Filtros: ${escapeHTML(selectedThermoCategory)} | Plataforma: ${escapeHTML(selectedThermoPlatform)}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const isBad = item.category === 'BAD_FOR_AIRBUS' || item.impact === 'BAD_FOR_AIRBUS' || (item.pressure_impact && String(item.pressure_impact).startsWith('+'));
    const isGood = item.category === 'GOOD_FOR_AIRBUS' || item.impact === 'GOOD_FOR_AIRBUS' || (item.pressure_impact && String(item.pressure_impact).startsWith('-'));
    
    let badgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
    let impactText = item.pressure_impact || '0°C';
    let impactBadgeClass = 'bg-slate-800 text-slate-400 border-slate-700';
    
    if (isBad) {
      badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      impactBadgeClass = 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-extrabold';
    } else if (isGood) {
      badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      impactBadgeClass = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold';
    }

    const plat = (item.platform || 'PRENSA').toUpperCase();
    let platIcon = 'newspaper';
    let platColor = 'text-emerald-400';
    let platLabel = item.channel || item.source || 'Prensa';

    if (plat === 'TWITTER' || (item.source && item.source.includes('Twitter'))) {
      platIcon = 'twitter';
      platColor = 'text-sky-400';
      platLabel = 'Twitter / X';
    } else if (plat === 'REDDIT' || (item.source && item.source.includes('Reddit'))) {
      platIcon = 'message-square';
      platColor = 'text-orange-400';
      platLabel = 'Reddit';
    } else if (plat === 'THREADS' || (item.source && item.source.includes('Threads'))) {
      platIcon = 'at-sign';
      platColor = 'text-purple-400';
      platLabel = 'Threads';
    } else if (plat === 'TELEGRAM' || (item.source && item.source.includes('Telegram'))) {
      platIcon = 'send';
      platColor = 'text-sky-400';
      platLabel = 'Telegram';
    }

    const safeUrl = sanitizeURL(item.url);

    return `
      <div class="p-4 bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 rounded-xl transition space-y-2 shadow-sm group">
        <div class="flex flex-wrap justify-between items-center gap-1.5">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              <i data-lucide="${escapeHTML(platIcon)}" class="w-3 h-3 ${escapeHTML(platColor)}"></i>
              <span>${escapeHTML(item.source || platLabel)}</span>
            </span>
            <span class="text-[10px] text-slate-500 font-mono">${escapeHTML(item.date || 'Reciente')}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="px-2 py-0.5 text-[9.5px] font-mono rounded ${impactBadgeClass}">
              ${escapeHTML(impactText)}
            </span>
            <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded ${badgeClass}">
              ${isBad ? 'Palanca Huelga' : (isGood ? 'Spin Empresa' : 'Seguimiento')}
            </span>
          </div>
        </div>

        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="text-xs sm:text-sm font-bold text-white group-hover:text-sky-400 transition block leading-snug">
          ${escapeHTML(item.title)} <i data-lucide="external-link" class="inline w-3 h-3 ml-1 text-slate-500 group-hover:text-sky-400"></i>
        </a>

        <p class="text-xs text-slate-300 leading-relaxed">${escapeHTML(item.summary || '')}</p>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// ==================== 2. PRIMARY SOURCES COMPENDIUM ====================

export function initSources() {
  const sourcesCatalogData = window.SOURCES_DATA || [];
  renderSourcesList(sourcesCatalogData);
  initSourceFilters();
}

export function filterSourceCategory(category) {
  selectedSourceCategory = category;

  document.querySelectorAll('.source-cat-pill').forEach(btn => {
    btn.classList.remove('bg-sky-600', 'text-white', 'font-bold');
    btn.classList.add('bg-slate-900', 'text-slate-300', 'font-medium');
  });

  const activeBtn = document.querySelector(`.source-cat-pill[data-category="${category}"]`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-slate-900', 'text-slate-300', 'font-medium');
    activeBtn.classList.add('bg-sky-600', 'text-white', 'font-bold');
  }

  searchSources();
}

export function searchSources() {
  const query = (document.getElementById('source-search')?.value || '').toLowerCase().trim();
  const sourcesCatalogData = window.SOURCES_DATA || [];

  let filtered = sourcesCatalogData;
  if (selectedSourceCategory !== 'ALL') {
    filtered = filtered.filter(s => normalizeCategory(s.category) === selectedSourceCategory);
  }

  if (query) {
    filtered = filtered.filter(s => 
      (s.title && s.title.toLowerCase().includes(query)) ||
      (s.id && s.id.toLowerCase().includes(query)) ||
      (s.summary && s.summary.toLowerCase().includes(query)) ||
      (s.category && s.category.toLowerCase().includes(query))
    );
  }

  renderSourcesList(filtered);
}

export const debouncedSourceSearch = debounce(() => searchSources(), 150);

function normalizeCategory(cat) {
  if (!cat) return "Otros Documentos";
  const c = cat.toLowerCase();
  if (c.includes("sima") || c.includes("legal") || c.includes("acta")) return "Actas SIMA & Legal";
  if (c.includes("dossier") || c.includes("salarial") || c.includes("económico")) return "Dossiers Económicos";
  if (c.includes("airbus se") || c.includes("financier") || c.includes("informe")) return "Informes Airbus SE";
  if (c.includes("convenio") || c.includes("boe")) return "Convenios & BOE";
  if (c.includes("benchmark") || c.includes("conflicto")) return "Benchmark";
  return "Otros Documentos";
}

export function renderSourcesList(sources) {
  const container = document.getElementById('sources-list-container');
  const countBadge = document.getElementById('sources-count-badge');
  if (!container) return;

  if (countBadge) {
    countBadge.textContent = `${sources.length} Fuentes`;
  }

  if (sources.length === 0) {
    container.innerHTML = `<div class="text-center py-8 text-xs text-slate-500">No se encontraron fuentes con el criterio especificado.</div>`;
    return;
  }

  container.innerHTML = sources.map((s, idx) => {
    const cat = normalizeCategory(s.category);
    let catBadgeColor = "bg-sky-500/20 text-sky-300 border-sky-500/30";
    if (cat === "Actas SIMA & Legal") catBadgeColor = "bg-purple-500/20 text-purple-300 border-purple-500/30";
    if (cat === "Dossiers Económicos") catBadgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/30";
    if (cat === "Informes Airbus SE") catBadgeColor = "bg-blue-500/20 text-blue-300 border-blue-500/30";
    if (cat === "Convenios & BOE") catBadgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    if (cat === "Benchmark") catBadgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";

    const chars = s.char_count ? `${(s.char_count/1000).toFixed(1)}k caracteres` : (s.section || '');
    const cleanId = (s.id || `fuente-${idx+1}`).replace(/[^a-zA-Z0-9_-]/g, '_');

    const safeTitle = escapeHTML(s.title);
    const safeSummary = s.summary ? `<p class="text-[11px] text-slate-400 line-clamp-1 leading-relaxed">${escapeHTML(s.summary)}</p>` : '';
    const safeUrl = sanitizeURL(s.url);
    const safeFilePath = sanitizeURL(s.file_path || `data/sources/${s.id}.txt`);

    return `
      <div class="p-3.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-xl transition flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2 py-0.5 text-[9px] font-extrabold rounded border ${catBadgeColor}">${escapeHTML(cat)}</span>
            <span class="text-[10px] text-slate-400 font-mono">${escapeHTML(s.type ? s.type.toUpperCase() : 'DOC')}</span>
            <span class="text-[10px] text-slate-500 font-mono">${escapeHTML(chars)}</span>
          </div>
          <h4 class="text-xs font-bold text-white leading-snug">${safeTitle}</h4>
          ${safeSummary}
        </div>
        <div class="flex items-center space-x-2 shrink-0">
          <button type="button" onclick="openSourceModal('${cleanId}')" class="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg text-xs font-bold transition flex items-center">
            <i data-lucide="file-text" class="w-3.5 h-3.5 mr-1 text-blue-400"></i>
            Ver Contenido
          </button>
          ${s.url ? `
            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition" title="Abrir URL original">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
          ` : `
            <a href="${safeFilePath}" download class="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition" title="Descargar texto">
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
            </a>
          `}
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function initSourceFilters() {
  const searchInput = document.getElementById('source-search');
  if (searchInput) {
    searchInput.addEventListener('input', debouncedSourceSearch);
  }
}

// ==================== 3. MODAL DE FUENTES CON CACHÉ ====================

export async function openSourceModal(sourceId) {
  const sourcesCatalogData = window.SOURCES_DATA || [];
  const tgDocs = window.telegramDocsData || window.CONFLICT_DATA?.telegram_archive?.documents || [];

  let src = sourcesCatalogData.find(s => {
    const cleanId = (s.id || '').replace(/[^a-zA-Z0-9_-]/g, '_');
    return cleanId === sourceId || s.id === sourceId || s.title === sourceId;
  });

  let isTg = false;
  if (!src) {
    src = tgDocs.find(d => {
      const cleanId = (d.id || '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const cleanTitle = (d.title || '').replace(/[^a-zA-Z0-9_-]/g, '_');
      return cleanId === sourceId || cleanTitle === sourceId || d.id === sourceId || d.title === sourceId;
    });
    if (src) isTg = true;
  }

  const modalEl = document.getElementById('source-modal');
  const titleEl = document.getElementById('modal-source-title');
  const catEl = document.getElementById('modal-source-category');
  const typeEl = document.getElementById('modal-source-type');
  const sizeEl = document.getElementById('modal-source-size');
  const contentEl = document.getElementById('modal-source-content');
  const linkEl = document.getElementById('modal-source-link');
  const metaEl = document.getElementById('modal-source-footer-meta');

  if (titleEl) titleEl.textContent = src ? src.title : `Documento #${sourceId}`;
  if (catEl) catEl.textContent = src ? normalizeCategory(src.category) : 'Documentación Primaria';
  if (typeEl) typeEl.textContent = isTg ? 'TELEGRAM OFICIAL' : (src?.type ? src.type.toUpperCase() : 'DOCUMENTO');
  if (sizeEl) sizeEl.textContent = src?.char_count ? `${src.char_count.toLocaleString()} caracteres` : (src?.size_chars ? `${(src.size_chars/1000).toFixed(1)}k caracteres` : '');
  if (metaEl) metaEl.textContent = isTg ? `Canal: EnfadadosconAirbus (${src?.file_path || 'Telegram'})` : `ID Fuente: ${src?.id || sourceId}`;

  if (linkEl) {
    const destUrl = src?.url || src?.group_url || (isTg ? 'https://t.me/+MnuqJDCAAgYyMGQ0' : '#');
    linkEl.href = sanitizeURL(destUrl);
    linkEl.classList.remove('hidden');
  }

  if (contentEl) {
    // Immediate display of embedded full text / preview
    if (src?.fulltext_preview && src.fulltext_preview.length > 50) {
      contentEl.textContent = src.fulltext_preview;
    } else if (src?.summary) {
      contentEl.textContent = src.summary;
    } else {
      contentEl.textContent = "Cargando transcripción íntegra...";
    }

    // Background live fetch if served via HTTP
    if (window.location.protocol !== 'file:' && src?.file_path) {
      try {
        const fetchPath = src.file_path.startsWith('http') ? src.file_path : (src.file_path.startsWith('data/') || src.file_path.startsWith('sources/') ? src.file_path : `data/${src.file_path}`);
        const res = await fetch(fetchPath);
        if (res.ok) {
          const fullText = await res.text();
          if (fullText && fullText.trim().length > 0) {
            contentEl.textContent = fullText;
          }
        }
      } catch (e) {
        // Keep embedded text
      }
    }
  }

  if (modalEl) {
    modalEl.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }
  if (window.lucide) lucide.createIcons();
}
// ==================== 4. TELEGRAM ARCHIVE BROWSER ====================

export async function initTelegramArchive() {
  try {
    const res = await fetch('data/telegram_archive/telegram_index.json');
    if (res.ok) {
      const data = await res.json();
      window.telegramDocsData = data.documents || [];
      renderTelegramDocsList(window.telegramDocsData);
    }
  } catch (e) {
    console.warn("Telegram archive offline");
  }
}

export function setTgCategory(cat) {
  currentTgCategory = cat;

  document.querySelectorAll('.tg-cat-pill').forEach(btn => {
    btn.classList.remove('bg-sky-600', 'text-white', 'font-bold');
    btn.classList.add('bg-slate-900', 'text-slate-300', 'font-medium');
  });

  const activeBtn = document.querySelector(`.tg-cat-pill[data-tgcat="${cat}"]`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-slate-900', 'text-slate-300', 'font-medium');
    activeBtn.classList.add('bg-sky-600', 'text-white', 'font-bold');
  }

  searchTelegramDocs();
}

export function searchTelegramDocs() {
  const query = (document.getElementById('tg-search')?.value || '').toLowerCase().trim();
  const docs = window.telegramDocsData || [];

  let filtered = docs;
  if (currentTgCategory !== 'ALL') {
    filtered = filtered.filter(d => d.category === currentTgCategory);
  }

  if (query) {
    filtered = filtered.filter(d => 
      (d.title && d.title.toLowerCase().includes(query)) ||
      (d.summary && d.summary.toLowerCase().includes(query)) ||
      (d.keywords && d.keywords.some(k => k.toLowerCase().includes(query)))
    );
  }

  renderTelegramDocsList(filtered);
}

export function renderTelegramDocsList(docs) {
  const container = document.getElementById('tg-docs-list-container');
  const countBadge = document.getElementById('tg-docs-count-badge');
  if (!container) return;

  if (countBadge) {
    countBadge.textContent = `${docs.length} Archivos`;
  }

  if (docs.length === 0) {
    container.innerHTML = `<div class="text-center py-8 text-xs text-slate-500">No se encontraron documentos con ese criterio de búsqueda.</div>`;
    return;
  }

  container.innerHTML = docs.map(doc => {
    const safeTitle = escapeHTML(doc.title);
    const safeCategory = escapeHTML(doc.category);
    const safeSummary = escapeHTML(doc.summary);
    const safePath = sanitizeURL(doc.path);

    return `
      <div class="p-3.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-xl transition flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded">${safeCategory}</span>
            <span class="text-[10px] text-slate-500 font-mono">${escapeHTML(doc.date || '')}</span>
          </div>
          <h4 class="text-xs font-bold text-white">${safeTitle}</h4>
          <p class="text-[11px] text-slate-400 line-clamp-1">${safeSummary}</p>
        </div>
        <div class="flex items-center space-x-2 shrink-0">
          <a href="${safePath}" download class="px-2.5 py-1.5 bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 rounded-lg text-xs font-bold transition flex items-center">
            <i data-lucide="download" class="w-3.5 h-3.5 mr-1"></i> Descargar
          </a>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// ==================== 5. STRATEGIC BENCHMARKS ====================

export function initBenchmarks() {
  const container = document.getElementById('benchmarks-container');
  if (!container) return;

  const data = window.CONFLICT_DATA?.benchmarks || [];
  if (data.length === 0) return;

  container.innerHTML = data.map(b => {
    const safeCase = escapeHTML(b.case);
    const safeSector = escapeHTML(b.sector || 'Sector Industrial');
    const safeDuration = escapeHTML(b.duration || (b.strike_duration_days ? b.strike_duration_days + ' días' : ''));
    const safeBadge = escapeHTML(b.badge || 'Caso Histórico');
    const safeInitialOffer = escapeHTML(b.initial_offer || '');
    const safeFinalAgreement = escapeHTML(b.final_agreement || '');
    const safeResult = escapeHTML(b.result || '');
    const safeLeverage = escapeHTML(b.leverage_mechanism || b.lesson || 'Presión industrial asimétrica');
    const safeLesson = escapeHTML(b.lesson || b.key_lesson || '');
    const safeSourceUrl = sanitizeURL(b.source_url || 'https://www.iam751.org/');
    const safeSourceName = escapeHTML(b.source_name || 'Registro Sindical / Prensa Sectorial');
    const badgeColor = escapeHTML(b.badgeColor || 'emerald');

    return `
      <div class="p-5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl transition flex flex-col justify-between space-y-4 shadow-lg hover:shadow-xl">
        <div class="space-y-3">
          <div class="flex justify-between items-start gap-2 border-b border-slate-800/80 pb-2.5">
            <div>
              <h4 class="text-sm font-bold text-white">${safeCase}</h4>
              <p class="text-[11px] text-slate-400 mt-0.5">${safeSector} • <span class="text-amber-400 font-bold">${safeDuration}</span></p>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-${badgeColor}-500/20 text-${badgeColor}-300 border border-${badgeColor}-500/40 shrink-0">
              ${safeBadge}
            </span>
          </div>

          <div class="grid grid-cols-1 gap-2 text-xs">
            ${safeInitialOffer ? `
              <div class="p-2 bg-rose-950/20 border border-rose-500/20 rounded-lg">
                <span class="text-[10px] font-extrabold uppercase text-rose-400 block mb-0.5">Oferta Inicial Patronal:</span>
                <p class="text-slate-300 text-[11px] leading-relaxed">${safeInitialOffer}</p>
              </div>
            ` : ''}
            ${safeFinalAgreement ? `
              <div class="p-2 bg-emerald-950/20 border border-emerald-500/20 rounded-lg">
                <span class="text-[10px] font-extrabold uppercase text-emerald-400 block mb-0.5">Acuerdo Final Conquistado:</span>
                <p class="text-slate-200 text-[11px] font-bold leading-relaxed">${safeFinalAgreement}</p>
              </div>
            ` : ''}
          </div>

          ${safeResult ? `
            <p class="text-xs text-slate-300 leading-relaxed">${safeResult}</p>
          ` : ''}
        </div>

        <div class="pt-3 border-t border-slate-800 space-y-2 text-[11px]">
          <div class="p-2 bg-sky-950/30 border border-sky-500/20 rounded-lg text-sky-300">
            <strong class="text-sky-400 font-bold">Palanca Clave:</strong> ${safeLeverage}
          </div>
          <div class="text-slate-400">
            <strong class="text-amber-400 font-bold">Lección para Airbus:</strong> ${safeLesson}
          </div>
          <div class="text-right pt-1">
            <a href="${safeSourceUrl}" target="_blank" rel="noopener noreferrer" class="text-sky-400 underline font-mono text-[9.5px]">[Fuente: ${safeSourceName}]</a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}
