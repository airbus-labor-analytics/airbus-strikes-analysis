// Airbus Spain 2026 Strike: Strategic & Financial Analytics Dashboard Controller (v5)
// Hardened security, debounced search, responsive lifecycle & offline/online data suite

// ==================== SECURITY & UTILITY HELPERS ====================
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitizeURL(url) {
  if (!url) return '';
  const clean = String(url).trim();
  if (/^(https?:\/\/|\/|\.\/|#|data\/|docs\/)/i.test(clean)) {
    return clean;
  }
  return '#';
}

function debounce(func, wait = 150) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
let conflictData = window.CONFLICT_DATA || null;
let sourcesCatalogData = window.SOURCES_DATA || [];
let telegramDocsData = [];
const chartRegistry = {};
let asymmetryChart = null;
let wagesChart = null;
let salaryEvolutionChart = null;
let airbusStockChart = null;
let companyRevenueChart = null;
let companyDeliveriesChart = null;
let shareholderPieChart = null;
let unionShareChart = null;
let unionEvolutionChart = null;
let siteDelegatesChart = null;
let referendumPieChart = null;
let referendumSitesChart = null;
let thermoFeedData = [];
let belugaPollingInterval = null;
let selectedSourceCategory = 'ALL';
let selectedTgCategory = 'ALL';
let currentModalSource = null;

// ==================== DYNAMIC CHRONOLOGY & METRIC DERIVATION ====================
function getConflictChronology(referenceDate = new Date()) {
  const startDate = new Date('2026-07-20T06:00:00Z');
  const now = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  const diffMs = Math.max(0, now.getTime() - startDate.getTime());
  const elapsedDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const elapsedHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const dailyBurnRate = 22.7; // M€/day
  const cumulativeCost = parseFloat((elapsedDays * dailyBurnRate).toFixed(1));
  return {
    startDate: startDate.toISOString(),
    currentDate: now.toISOString(),
    elapsedDays,
    elapsedHours,
    dailyBurnRate,
    cumulativeCost
  };
}

function updateDynamicChronologyDOM() {
  const chrono = getConflictChronology();
  document.querySelectorAll('.dynamic-conflict-days').forEach(el => {
    el.textContent = `${chrono.elapsedDays} días`;
  });
  document.querySelectorAll('.dynamic-cumulative-cost').forEach(el => {
    el.textContent = `${chrono.cumulativeCost.toLocaleString()} M€`;
  });
  document.querySelectorAll('.dynamic-daily-cost').forEach(el => {
    el.textContent = `${chrono.dailyBurnRate.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M€/día`;
  });
  document.querySelectorAll('.dynamic-total-docs').forEach(el => {
    el.textContent = `${sourcesCatalogData.length} doc.`;
  });
  document.querySelectorAll('.dynamic-total-sources-count').forEach(el => {
    el.textContent = `${sourcesCatalogData.length}`;
  });
}

// ==================== RESILIENT CHART LIFECYCLE ENGINE ====================
// Disable animations globally for instantaneous, zero-latency rendering across all charts & updates
if (typeof Chart !== 'undefined') {
  Chart.defaults.animation = false;
  Chart.defaults.responsiveAnimationDuration = 0;
  if (Chart.defaults.transitions && Chart.defaults.transitions.active) {
    Chart.defaults.transitions.active.animation = { duration: 0 };
  }
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = "'Geist Mono', 'JetBrains Mono', 'SF Mono', Consolas, monospace";
  if (Chart.defaults.plugins && Chart.defaults.plugins.tooltip) {
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(8, 12, 20, 0.94)';
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(56, 189, 248, 0.35)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.titleColor = '#38bdf8';
    Chart.defaults.plugins.tooltip.titleFont = { size: 12, weight: 'bold', family: "'Geist', sans-serif" };
    Chart.defaults.plugins.tooltip.bodyColor = '#f8fafc';
    Chart.defaults.plugins.tooltip.bodyFont = { size: 11, family: "'Geist Mono', monospace" };
    Chart.defaults.plugins.tooltip.cornerRadius = 10;
    Chart.defaults.plugins.tooltip.boxPadding = 4;
  }
}
function renderResilientChart(canvasId, configBuilder) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 1. Teardown existing instance via registry or Chart.js internal cache
  if (chartRegistry[canvasId]) {
    try {
      chartRegistry[canvasId].destroy();
    } catch (e) {
      console.warn(`Error destroying chart ${canvasId}:`, e);
    }
    delete chartRegistry[canvasId];
  }
  const existingChart = typeof Chart !== 'undefined' && Chart.getChart ? Chart.getChart(canvas) : null;
  if (existingChart) {
    try {
      existingChart.destroy();
    } catch (e) {
      console.warn(`Error destroying internal chart for ${canvasId}:`, e);
    }
  }

  // 2. Build configuration with error boundary and instant rendering
  try {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js library not loaded yet.');
      return null;
    }
    // Ensure Chart defaults remain zero-delay
    Chart.defaults.animation = false;
    Chart.defaults.responsiveAnimationDuration = 0;

    const config = typeof configBuilder === 'function' ? configBuilder(ctx) : configBuilder;
    if (config) {
      if (!config.options) config.options = {};
      config.options.animation = false;
      config.options.responsiveAnimationDuration = 0;
      const newChart = new Chart(ctx, config);
      chartRegistry[canvasId] = newChart;
      return newChart;
    }
  } catch (err) {
    console.error(`Error rendering chart ${canvasId}:`, err);
  }
  return null;
}
const debouncedFilterSources = debounce(() => filterSources(), 150);
const debouncedFilterTelegramDocs = debounce(() => filterTelegramDocs(), 150);
// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  // 1. Establish baseline data immediately
  if (!conflictData && window.CONFLICT_DATA) {
    conflictData = window.CONFLICT_DATA;
  }
  if ((!sourcesCatalogData || sourcesCatalogData.length === 0) && window.SOURCES_DATA) {
    sourcesCatalogData = window.SOURCES_DATA;
  }

  // 2. Render all modules immediately (zero blank screen, 100% offline & local file:// support)
  initAllModules();

  // 3. Start Live Auto-Sync Engine (queries GitHub raw and relative datasets every 120s)
  startAutoSyncEngine();
  // 5. Setup modal keyboard listener (Escape key to close)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSourceModal();
    }
  });

  // 6. Close modal on backdrop click
  const modalEl = document.getElementById('source-modal');
  if (modalEl) {
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) {
        closeSourceModal();
      }
    });
  }

  // 7. Support direct deep-linking via URL hash (e.g. #tab-sources, #tab-industrial:sec-industrial-fleet)
  function handleHashNavigation() {
    const rawHash = window.location.hash.replace('#', '').trim();
    if (!rawHash) {
      switchTab('tab-portal');
      return;
    }
    let targetTab = rawHash;
    let targetSection = null;
    if (rawHash.includes(':') || rawHash.includes('/') || rawHash.includes('__')) {
      const parts = rawHash.split(/[:\/__]+/);
      targetTab = parts[0];
      targetSection = parts[1];
    }
    switchTab(targetTab);
    if (targetSection) {
      setTimeout(() => {
        scrollToSection(targetSection);
      }, 150);
    }
  }
  handleHashNavigation();
  restoreSimulatorFromURL();

  // 8. Initialize ScrollSpy for Right-Hand Floating Section Navigator
  initSectionNavScrollSpy();

  // 9. Initialize Global Keyboard Shortcuts & Toast System
  initKeyboardShortcuts();

  // 10. Lifecycle Management: Pause polling on tab hidden to preserve battery and network
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (belugaPollingInterval) {
        clearInterval(belugaPollingInterval);
        belugaPollingInterval = null;
      }
    } else {
      if (!belugaPollingInterval) {
        startBelugaLivePolling();
      }
    }
  });

  // 9. Floating Dynamic Island HUD & Quick Drawer
  initFloatingHUD();
});

function initAllModules() {
  updateDynamicChronologyDOM();
  initBenchmarks();
  initSources();
  initWorkflows();
  initHistoricalLosses();
  initNegotiationEvolution();
  initTimeline();
  initTelegramArchive();
  initThermometer();
  initBelugaLogistics();
  updateAsymmetrySimulation();
  updateWageSimulation();
  // Tab overview is default visible tab
  initAsymmetryChart();
  initAirbusStockChart();
  initCompanyHealthCharts();
  if (window.lucide) lucide.createIcons();
}

let lastSyncTimestamp = null;
let autoSyncInterval = null;

async function fetchJsonWithFallbacks(paths) {
  for (const path of paths) {
    try {
      // Add cache buster to prevent stale browser caching
      const url = path.includes('?') ? `${path}&_t=${Date.now()}` : `${path}?_t=${Date.now()}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data) return data;
      }
    } catch (e) {
      // Try next candidate fallback URL
    }
  }
  return null;
}

async function syncDataInBackground(manual = false) {
  if (window.location.protocol === 'file:' && !manual) return;

  const syncBtn = document.getElementById('btn-live-sync');
  const syncIcon = document.getElementById('live-sync-icon');
  const syncText = document.getElementById('live-sync-text');
  const syncDot = document.getElementById('live-sync-indicator');

  if (syncIcon) syncIcon.classList.add('animate-spin');
  if (syncText && manual) syncText.textContent = 'Sincronizando...';

  try {
    // 0. Fetch Sync Status Metadata
    const syncStatusData = await fetchJsonWithFallbacks([
      'data/sync_status.json',
      './data/sync_status.json',
      '../data/sync_status.json'
    ]);

    let isDegraded = false;
    if (syncStatusData && syncStatusData.system_status) {
      isDegraded = (syncStatusData.system_status === 'degraded');
    }

    // 1. Fetch Conflict Metrics & Full Dataset
    const metricsData = await fetchJsonWithFallbacks([
      'data/conflict_metrics.json',
      './data/conflict_metrics.json',
      '../data/conflict_metrics.json',
      'https://raw.githubusercontent.com/sergiomh499/airbus-strikes-analysis/main/data/conflict_metrics.json'
    ]);
    if (metricsData && metricsData.parameters) {
      conflictData = metricsData;
      if (metricsData.sources_catalog && metricsData.sources_catalog.length > 0) {
        sourcesCatalogData = metricsData.sources_catalog;
      }
    }

    // 2. Fetch Telegram Archive Catalog
    const tgData = await fetchJsonWithFallbacks([
      'data/telegram_archive/telegram_index.json',
      './data/telegram_archive/telegram_index.json',
      '../data/telegram_archive/telegram_index.json',
      'https://raw.githubusercontent.com/sergiomh499/airbus-strikes-analysis/main/data/telegram_archive/telegram_index.json'
    ]);

    if (tgData && tgData.documents) {
      if (conflictData) conflictData.telegram_archive = tgData;
      telegramDocsData = tgData.documents;
    }

    // 3. Fetch Sentiment Thermometer Live Feed
    const thermoData = await fetchJsonWithFallbacks([
      'data/thermometer_data.json',
      './data/thermometer_data.json',
      '../data/thermometer_data.json',
      'https://raw.githubusercontent.com/sergiomh499/airbus-strikes-analysis/main/data/thermometer_data.json'
    ]);

    if (thermoData && thermoData.temperature_celsius) {
      if (conflictData) conflictData.sentiment_thermometer = thermoData;
    }

    // 4. Fetch Beluga Flight Tracking Status
    const belugaData = await fetchJsonWithFallbacks([
      'data/beluga_status.json',
      './data/beluga_status.json',
      '../data/beluga_status.json',
      'https://raw.githubusercontent.com/sergiomh499/airbus-strikes-analysis/main/data/beluga_status.json'
    ]);

    if (belugaData && belugaData.fleet_count) {
      if (conflictData) conflictData.beluga_logistics = belugaData;
    }

    // Refresh active views with updated dataset
    updateDynamicChronologyDOM();
    initHistoricalLosses();
    initNegotiationEvolution();
    initTimeline();
    initWorkflows();
    initTelegramArchive();
    initThermometer();
    initBelugaLogistics();
    initSources();
    updateAsymmetrySimulation();
    updateWageSimulation();
    lastSyncTimestamp = new Date();
    const timeStr = lastSyncTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    if (syncText) {
      syncText.textContent = isDegraded ? `En Vivo (Aviso - ${timeStr})` : `En Vivo (${timeStr})`;
    }
    if (syncDot) {
      syncDot.className = isDegraded 
        ? 'w-2 h-2 rounded-full bg-amber-400 mr-2 animate-pulse' 
        : 'w-2 h-2 rounded-full bg-emerald-400 mr-2';
    }
  } catch (err) {
    console.warn('Auto-sync notice: using retained baseline data.', err);
    if (syncText && manual) syncText.textContent = 'En Vivo';
  } finally {
    setTimeout(() => {
      if (syncIcon) syncIcon.classList.remove('animate-spin');
      if (window.lucide) lucide.createIcons();
    }, 500);
  }
}

function triggerManualSync() {
  syncDataInBackground(true);
}

function startAutoSyncEngine() {
  // Run initial background sync
  syncDataInBackground(false);

  // Re-sync every 30 seconds (30,000 ms) automatically without page reload
  clearInterval(autoSyncInterval);
  autoSyncInterval = setInterval(() => {
    if (!document.hidden) {
      syncDataInBackground(false);
    }
  }, 30000);
}

// Mobile Sidebar Toggle & Backdrop
function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar-menu');
  let backdrop = document.getElementById('sidebar-backdrop');
  
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'sidebar-backdrop';
    backdrop.className = 'fixed inset-0 bg-black/70 z-30 lg:hidden transition-opacity duration-300 opacity-0 pointer-events-none';
    backdrop.onclick = toggleMobileSidebar;
    document.body.appendChild(backdrop);
  }
  
  if (sidebar) {
    const isClosed = sidebar.classList.contains('-translate-x-full');
    if (isClosed) {
      sidebar.classList.remove('-translate-x-full');
      backdrop.classList.remove('opacity-0', 'pointer-events-none');
      backdrop.classList.add('opacity-100');
    } else {
      sidebar.classList.add('-translate-x-full');
      backdrop.classList.remove('opacity-100');
      backdrop.classList.add('opacity-0', 'pointer-events-none');
    }
  }
}

// Live Refresh Beluga Action
async function refreshBelugaLive(manual = true) {
  const btn = document.querySelector('button[onclick*="refreshBelugaLive"]');
  const icon = btn?.querySelector('i');
  if (icon) icon.classList.add('animate-spin');

  try {
    const res = await fetch('data/beluga_status.json', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (conflictData) {
        conflictData.beluga_logistics = data;
        initBelugaLogistics();
      }
    }
  } catch (e) {
    console.warn('Beluga fetch offline, re-rendering cache:', e);
    initBelugaLogistics();
  } finally {
    setTimeout(() => {
      if (icon) icon.classList.remove('animate-spin');
      if (window.lucide) lucide.createIcons();
    }, 400);
  }
}

// Tab Switcher for 5 Unified Modules
function switchTab(tabId) {
  let normalizedTabId = tabId.startsWith('tab-') ? tabId : `tab-${tabId}`;

  // Backward compatibility alias map
  const tabAliases = {
    'tab-portal': 'tab-portal',
    'tab-inicio': 'tab-portal',
    'tab-mapa': 'tab-portal',
    'tab-financiero': 'tab-overview',
    'tab-logistica': 'tab-industrial',
    'tab-salarios': 'tab-purchasing-power',
    'tab-sindical': 'tab-union-force',
    'tab-evidencias': 'tab-evidence',
    'tab-kpis': 'tab-overview',
    'tab-stock': 'tab-overview',
    'tab-company-health': 'tab-overview',
    'tab-jit': 'tab-industrial',
    'tab-thermometer': 'tab-industrial',
    'tab-beluga': 'tab-industrial',
    'tab-wages': 'tab-purchasing-power',
    'tab-historical-losses': 'tab-purchasing-power',
    'tab-negotiation': 'tab-purchasing-power',
    'tab-unions': 'tab-union-force',
    'tab-referendum': 'tab-union-force',
    'tab-timeline': 'tab-union-force',
    'tab-workflows': 'tab-union-force',
    'tab-sources': 'tab-evidence',
    'tab-telegram-archive': 'tab-evidence',
    'tab-benchmarks': 'tab-evidence',
    'tab-checklist': 'tab-purchasing-power'
  };

  if (tabAliases[normalizedTabId]) {
    normalizedTabId = tabAliases[normalizedTabId];
  }
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  
  // Update dock buttons
  document.querySelectorAll('.dock-btn').forEach(btn => {
    btn.classList.remove('bg-blue-600', 'text-white', 'font-bold', 'shadow-lg', 'shadow-blue-600/30');
    btn.classList.add('text-slate-400');
  });
  const activeDockBtn = document.getElementById(`dock-${normalizedTabId}`);
  if (activeDockBtn) {
    activeDockBtn.classList.remove('text-slate-400');
    activeDockBtn.classList.add('bg-blue-600', 'text-white', 'font-bold', 'shadow-lg', 'shadow-blue-600/30');
  }

  // Reset window scroll position to top
  window.scrollTo({ top: 0, behavior: 'instant' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const activeTab = document.getElementById(normalizedTabId);
  if (activeTab) activeTab.classList.remove('hidden');

  // Update Right-Hand Floating Section Map
  updateSectionNav(normalizedTabId);
  // Update URL hash smoothly
  try {
    if (history.replaceState) {
      history.replaceState(null, null, `#${normalizedTabId}`);
    }
  } catch (e) {}

  // Render active module charts immediately on next frame without artificial timeout
  requestAnimationFrame(() => {
    if (normalizedTabId === 'tab-overview') {
      initAsymmetryChart();
      updateAsymmetrySimulation();
      initAirbusStockChart();
      initCompanyHealthCharts();
    } else if (normalizedTabId === 'tab-industrial') {
      initThermometer();
      initBelugaLogistics();
    } else if (normalizedTabId === 'tab-purchasing-power') {
      initSalaryEvolutionChart();
      initWagesChart();
      updateWageSimulation();
      initHistoricalLosses();
      initNegotiationEvolution();
    } else if (normalizedTabId === 'tab-union-force') {
      initUnionCharts();
      initTimeline();
      initWorkflows();
    } else if (normalizedTabId === 'tab-evidence') {
      initThermometer();
      initSources();
      initTelegramArchive();
      initBenchmarks();
    }

    // Ensure all active Chart.js instances perform a clean immediate resize
    const activeCanvases = activeTab ? activeTab.querySelectorAll('canvas') : [];
    activeCanvases.forEach(canvas => {
      const chartInstance = typeof Chart !== 'undefined' && Chart.getChart ? Chart.getChart(canvas) : null;
      if (chartInstance && typeof chartInstance.resize === 'function') {
        chartInstance.resize();
      }
    });

    if (window.lucide) lucide.createIcons();
  });
}

// ==================== RIGHT-HAND FLOATING SECTION MAP ====================
const TAB_SECTION_MAP = {
  'tab-portal': {
    title: 'Portal Hub',
    sections: [
      { id: 'sec-portal-mission', label: 'Misión & Principios', icon: 'shield-check' },
      { id: 'sec-portal-kpis', label: 'KPIs Ejecutivos Flash', icon: 'trending-up' },
      { id: 'sec-portal-sitemap', label: 'Mapa del Portal', icon: 'compass' }
    ]
  },
  'tab-overview': {
    title: 'Finanzas',
    sections: [
      { id: 'sec-overview-kpis', label: 'KPIs Principales', icon: 'trending-up' },
      { id: 'sec-overview-asymmetry', label: 'Simulador Asimetría', icon: 'scale' },
      { id: 'sec-overview-chart', label: 'Proyección Huelga', icon: 'bar-chart-2' },
      { id: 'sec-overview-stock', label: 'Cotización AIR.PA', icon: 'trending-down' },
      { id: 'sec-overview-solvency', label: 'Solvencia & Dividendos', icon: 'shield-check' }
    ]
  },
  'tab-industrial': {
    title: 'Beluga / Logística',
    sections: [
      { id: 'sec-industrial-hero', label: 'Monitor Estrangulamiento JIT', icon: 'shield-alert' },
      { id: 'sec-industrial-beluga', label: 'Flota BelugaXL Live', icon: 'compass' },
      { id: 'sec-industrial-routes', label: 'Rutas & Conexiones FALs', icon: 'navigation' },
      { id: 'sec-industrial-movements', label: 'Registro de Movimientos', icon: 'history' },
      { id: 'sec-industrial-fals', label: 'Cuello de Botella FALs', icon: 'boxes' }
    ]
  },
  'tab-purchasing-power': {
    title: 'Salarios & ROI',
    sections: [
      { id: 'sec-wages-simulator', label: 'Simulador Multivariante', icon: 'calculator' },
      { id: 'sec-wages-audit', label: 'Efecto Abril & IPC', icon: 'scissors' },
      { id: 'sec-wages-scenarios', label: 'Comparativa Escenarios', icon: 'layers' },
      { id: 'sec-wages-roi', label: 'Desglose Beneficios & ROI', icon: 'table' },
      { id: 'sec-wages-losses', label: 'Pérdidas 2020-2025 (BOE)', icon: 'file-text' },
      { id: 'sec-wages-negotiation', label: 'Mesa de Negociación', icon: 'scale' }
    ]
  },
  'tab-union-force': {
    title: 'Fuerza Sindical',
    sections: [
      { id: 'sec-unions-delegates', label: 'Representación Sindical', icon: 'users' },
      { id: 'sec-unions-referendum', label: 'Referéndum 24-Julio', icon: 'vote' },
      { id: 'sec-unions-sections', label: 'Secciones Sindicales', icon: 'pie-chart' },
      { id: 'sec-unions-sociology', label: 'Claves Sociológicas', icon: 'shield-alert' },
      { id: 'sec-unions-timeline', label: 'Línea Temporal & Minutas', icon: 'history' },
      { id: 'sec-unions-workflows', label: 'Árboles de Decisión', icon: 'git-merge' }
    ]
  },
  'tab-evidence': {
    title: 'Evidencias',
    sections: [
      { id: 'sec-evidence-media-feed', label: 'Termómetro & Feed Redes', icon: 'flame' },
      { id: 'sec-evidence-sources', label: 'Fuentes Primarias (269+)', icon: 'book-open' },
      { id: 'sec-evidence-telegram', label: 'Canal Telegram & Docs', icon: 'send' },
      { id: 'sec-evidence-benchmarks', label: 'Benchmark Conflictos', icon: 'award' }
    ]
  }
};

function updateSectionNav(tabId) {
  const container = document.getElementById('section-nav-links');
  if (!container) return;

  const tabConfig = TAB_SECTION_MAP[tabId];
  if (!tabConfig || !tabConfig.sections || tabConfig.sections.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = tabConfig.sections.map((sec, idx) => `
    <button type="button" onclick="scrollToSection('${sec.id}')" id="nav-btn-${sec.id}" class="section-nav-item text-left transition-all duration-200 text-[10.5px] py-0.5 -ml-[13px] pl-3 border-l block truncate max-w-[170px] ${idx === 0 ? 'text-sky-400 font-semibold scale-105 origin-left border-sky-400' : 'text-slate-500 hover:text-slate-300 border-transparent hover:border-slate-500'}">
      ${sec.label}
    </button>
  `).join('');
}

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (!el) return;
  const headerOffset = 90;
  const elementPosition = el.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

  window.scrollTo({
    top: Math.max(0, offsetPosition),
    behavior: 'smooth'
  });

  const currentTab = document.querySelector('.tab-content:not(.hidden)');
  if (currentTab && history.replaceState) {
    history.replaceState(null, null, `#${currentTab.id}:${sectionId}`);
  }
}

function initSectionNavScrollSpy() {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScrollSpy();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

function handleScrollSpy() {
  const currentTab = document.querySelector('.tab-content:not(.hidden)');
  if (!currentTab) return;

  const tabConfig = TAB_SECTION_MAP[currentTab.id];
  if (!tabConfig || !tabConfig.sections || tabConfig.sections.length === 0) return;

  const scrollY = window.pageYOffset + 130;
  let activeSectionId = tabConfig.sections[0].id;

  for (const sec of tabConfig.sections) {
    const el = document.getElementById(sec.id);
    if (el) {
      const top = el.offsetTop;
      if (scrollY >= top) {
        activeSectionId = sec.id;
      }
    }
  }

  document.querySelectorAll('.section-nav-item').forEach(btn => {
    btn.classList.remove('text-sky-400', 'font-semibold', 'scale-105', 'origin-left', 'border-sky-400');
    btn.classList.add('text-slate-500', 'border-transparent');
  });

  const activeBtn = document.getElementById(`nav-btn-${activeSectionId}`);
  if (activeBtn) {
    activeBtn.classList.remove('text-slate-500', 'border-transparent');
    activeBtn.classList.add('text-sky-400', 'font-semibold', 'scale-105', 'origin-left', 'border-sky-400');
  }
}

// ==================== TOAST NOTIFICATION SYSTEM ====================
function showToast(message, iconName = 'info', durationMs = 2800) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-20 right-6 z-50 flex flex-col space-y-2 pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto transform transition-all duration-300 translate-y-2 opacity-0 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-white/15 text-white text-xs font-medium shadow-2xl shadow-black/80';
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-4 h-4 text-sky-400 shrink-0"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 350);
  }, durationMs);
}

// ==================== KEYBOARD SHORTCUTS CONTROLLER ====================
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) {
      if (e.key === 'Escape') {
        e.target.blur();
      }
      return;
    }

    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === '0' || e.key === 'p' || e.key === 'P') {
      switchTab('tab-portal');
      showToast('Navegación: Portal Hub', 'compass');
    } else if (e.key === '1' || e.key === 'f' || e.key === 'F') {
      switchTab('tab-overview');
      showToast('Navegación: Finanzas & Asimetría', 'trending-up');
    } else if (e.key === '2' || e.key === 'b' || e.key === 'B') {
      switchTab('tab-industrial');
      showToast('Navegación: Beluga & Logística', 'boxes');
    } else if (e.key === '3' || e.key === 's' || e.key === 'S') {
      switchTab('tab-purchasing-power');
      showToast('Navegación: Salarios & Convenio', 'calculator');
    } else if (e.key === '4' || e.key === 'u' || e.key === 'U') {
      switchTab('tab-union-force');
      showToast('Navegación: Fuerza Sindical', 'users');
    } else if (e.key === '5' || e.key === 'e' || e.key === 'E') {
      switchTab('tab-evidence');
      showToast('Navegación: Evidencias & Archivo', 'book-open');
    } else if (e.key === '/') {
      e.preventDefault();
      const currentTab = document.querySelector('.tab-content:not(.hidden)');
      if (currentTab && currentTab.id === 'tab-evidence') {
        const input = document.getElementById('source-search');
        if (input) input.focus();
      } else {
        switchTab('tab-evidence');
        setTimeout(() => {
          const input = document.getElementById('source-search');
          if (input) input.focus();
        }, 100);
      }
    } else if (e.key === 't' || e.key === 'T') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (e.key === '?') {
      toggleShortcutsModal();
    } else if (e.key === 'Escape') {
      closeShortcutsModal();
    }
  });
}

function toggleShortcutsModal() {
  const modal = document.getElementById('shortcuts-modal');
  if (!modal) return;
  modal.classList.toggle('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeShortcutsModal() {
  const modal = document.getElementById('shortcuts-modal');
  if (modal) modal.classList.add('hidden');
}

function copySectionLink(sectionId) {
  const currentTab = document.querySelector('.tab-content:not(.hidden)');
  const tabId = currentTab ? currentTab.id : 'tab-portal';
  const url = `${window.location.origin}${window.location.pathname}#${tabId}:${sectionId}`;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('Enlace directo copiado al portapapeles', 'link-2');
    }).catch(() => {
      showToast('Enlace: ' + url, 'link-2');
    });
  } else {
    showToast('Enlace: ' + url, 'link-2');
  }
}
function setAsymmetryDays(days) {
  const slider = document.getElementById('slider-days');
  if (slider) {
    slider.value = days;
    updateAsymmetrySimulation();
  }
}

// ==================== ASYMMETRY SIMULATOR ====================
function updateAsymmetrySimulation() {
  const slider = document.getElementById('slider-days');
  if (!slider) return;
  const days = parseInt(slider.value, 10);
  const salary = 50000;
  const daysValEl = document.getElementById('slider-days-val');
  if (daysValEl) daysValEl.textContent = `${days} día${days > 1 ? 's' : ''}`;

  const dailyWorkerGross = salary / 365.0;
  const dailyWorkerNet = dailyWorkerGross * 0.72;
  const totalWorkers = conflictData?.parameters?.total_workers_spain || 15562;

  let airbusLoss = 0;
  for (let d = 1; d <= days; d++) {
    if (d <= 3) {
      airbusLoss += 6.5;
    } else if (d <= 5) {
      airbusLoss += 16.5;
    } else {
      airbusLoss += 22.7;
    }
  }

  const workerLossPerPerson = days * dailyWorkerNet;
  const collectivePayrollSaved = (days * dailyWorkerGross * totalWorkers) / 1e6;
  const ratio = collectivePayrollSaved > 0 ? (airbusLoss / collectivePayrollSaved) : 0;

  const airbusLossEl = document.getElementById('calc-airbus-loss');
  const workerLossEl = document.getElementById('calc-worker-loss');
  const payrollSavedEl = document.getElementById('calc-payroll-saved');
  const asymmetryRatioEl = document.getElementById('calc-asymmetry-ratio');

  if (airbusLossEl) airbusLossEl.textContent = `${airbusLoss.toFixed(1)} M€`;
  if (workerLossEl) workerLossEl.textContent = `${Math.round(workerLossPerPerson).toLocaleString()} €`;
  if (payrollSavedEl) payrollSavedEl.textContent = `${collectivePayrollSaved.toFixed(1)} M€`;
  if (asymmetryRatioEl) asymmetryRatioEl.textContent = `${ratio.toFixed(1)}x nómina`;
}

function initAsymmetryChart() {
  const days = [1, 3, 5, 7, 10, 15, 20, 30];
  const airbusLoss = [6.5, 19.5, 52.5, 97.9, 166.0, 279.5, 393.0, 620.0];
  const platformCost = [239, 239, 239, 239, 239, 239, 239, 239];
  const payrollSaved = [2.1, 6.4, 10.7, 14.9, 21.3, 32.0, 42.6, 63.9];

  asymmetryChart = renderResilientChart('asymmetryChart', () => ({
    type: 'line',
    data: {
      labels: days.map(d => `${d}d`),
      datasets: [
        {
          label: 'Pérdida Acumulada Airbus SE (M€)',
          data: airbusLoss,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          fill: true,
          tension: 0.3,
          borderWidth: 3
        },
        {
          label: 'Coste Anual Plataforma Sindical (239 M€)',
          data: platformCost,
          borderColor: '#3b82f6',
          borderDash: [6, 4],
          borderWidth: 2,
          pointRadius: 0
        },
        {
          label: 'Ahorro Salarial Colectivo Empresa (M€)',
          data: payrollSaved,
          borderColor: '#10b981',
          borderWidth: 2,
          tension: 0.1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: { color: '#94a3b8', callback: v => `${v} M€` }
        },
        x: {
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: { color: '#94a3b8' }
        }
      },
      plugins: {
        legend: { labels: { color: '#e2e8f0', font: { size: 11, weight: 'bold' } } }
      }
    }
  }));
}

// ==================== WAGE & TOTAL BENEFITS SIMULATOR ====================
function setSalaryPreset(val) {
  const salaryInput = document.getElementById('sim-salary');
  if (salaryInput) {
    salaryInput.value = val;
    updateWageSimulation();
  }
}

function setIpcPreset(val) {
  const ipcInput = document.getElementById('sim-ipc-rate');
  if (ipcInput) {
    ipcInput.value = val;
    const badge = document.getElementById('sim-ipc-badge');
    if (badge) badge.textContent = val.toFixed(1).replace('.', ',') + '%';
    updateWageSimulation();
  }
}
function evaluateAnnualRaise(ipcRate, rsgMode = 'ipc_100', rsgMargin = 0.0, rsgCap = null) {
  let nominalRaise = 0.0;
  if (rsgMode === 'none') {
    nominalRaise = rsgMargin;
  } else if (rsgMode === 'ipc_100') {
    nominalRaise = ipcRate;
  } else if (rsgMode === 'ipc_margin') {
    nominalRaise = ipcRate + rsgMargin;
  } else {
    nominalRaise = ipcRate;
  }
  if (rsgCap !== null && rsgCap !== undefined && rsgCap > 0) {
    nominalRaise = Math.min(nominalRaise, rsgCap);
  }
  return Math.max(nominalRaise, 0.0);
}

function solveRecoveryInitialRaise(histLoss = 0.118, targetYear = 2030, rsgMargin = 0.0) {
  const years = Math.max(targetYear - 2025, 1);
  if (rsgMargin === 0.0) return histLoss;
  return (1.0 + histLoss) / Math.pow(1.0 + rsgMargin, years - 1) - 1.0;
}

function getCustomProposalState() {
  const slider = document.getElementById('sim-custom-raise') || document.getElementById('custom-raise-slider');
  const raiseInput = document.getElementById('sim-custom-raise-input');
  const arrearsInput = document.getElementById('sim-custom-arrears') || document.getElementById('sim-custom-arrears-input') || document.getElementById('custom-arrears-input');
  const rsgModeSel = document.getElementById('sim-custom-rsg-mode') || document.getElementById('custom-rsg-mode');
  const ipcLinkedToggle = document.getElementById('sim-custom-ipc-linked');
  const marginInput = document.getElementById('sim-custom-rsg-margin');
  const capToggle = document.getElementById('sim-custom-cap-toggle');
  const capInput = document.getElementById('sim-custom-rsg-cap') || document.getElementById('custom-cap-mode');

  // Initial raise %
  let initialRaisePct = 8.0;
  if (raiseInput && raiseInput.value !== '') {
    initialRaisePct = parseFloat(raiseInput.value) || 0.0;
  } else if (slider) {
    initialRaisePct = parseFloat(slider.value) || 8.0;
  }

  // Arrears €
  const arrears = arrearsInput ? (parseFloat(arrearsInput.value) || 0) : 4000;

  // RSG Mode & Margin
  const isIpcLinked = ipcLinkedToggle ? ipcLinkedToggle.checked : (rsgModeSel ? rsgModeSel.value !== 'none' : true);
  const rawMargin = marginInput ? (parseFloat(marginInput.value) || 0.0) / 100.0 : 0.0;
  
  let rsgMode = 'ipc_100';
  let rsgMargin = 0.0;
  if (!isIpcLinked) {
    rsgMode = 'none';
    rsgMargin = rawMargin !== 0.0 ? rawMargin : 0.015;
  } else if (rawMargin !== 0.0) {
    rsgMode = 'ipc_margin';
    rsgMargin = rawMargin;
  } else {
    rsgMode = rsgModeSel ? rsgModeSel.value : 'ipc_100';
    rsgMargin = rsgMode === 'ipc_margin' ? 0.01 : 0.0;
  }

  // Hyperinflation Cap
  let capVal = null;
  const isCapEnabled = capToggle ? capToggle.checked : (capInput && capInput.value !== 'none');
  if (isCapEnabled && capInput && capInput.value !== '' && capInput.value !== 'none') {
    capVal = parseFloat(capInput.value) / 100.0;
  }

  return { initialRaisePct, arrears, rsgMode, rsgMargin, rsgCap: capVal };
}

function updateCustomRaise(val, source = 'slider') {
  const slider = document.getElementById('sim-custom-raise') || document.getElementById('custom-raise-slider');
  const raiseInput = document.getElementById('sim-custom-raise-input');
  const badge = document.getElementById('sim-custom-raise-badge') || document.getElementById('custom-raise-badge');

  const numVal = parseFloat(val) || 0;
  if (source === 'slider' && raiseInput) {
    raiseInput.value = numVal.toFixed(1);
  } else if (source === 'input' && slider) {
    slider.value = numVal;
  }
  if (badge) badge.textContent = `${numVal.toFixed(1).replace('.', ',')}%`;
  updateWageSimulation();
}

function setCustomArrearsQuick(amount) {
  const arrearsInput = document.getElementById('sim-custom-arrears') || document.getElementById('sim-custom-arrears-input');
  if (arrearsInput) {
    arrearsInput.value = amount;
  }
  updateWageSimulation();
}

function onRsgModeSelectChange(mode) {
  const ipcLinkedToggle = document.getElementById('sim-custom-ipc-linked');
  const marginInput = document.getElementById('sim-custom-rsg-margin');
  if (mode === 'none') {
    if (ipcLinkedToggle) ipcLinkedToggle.checked = false;
    if (marginInput) marginInput.value = '1.5';
  } else if (mode === 'ipc_margin') {
    if (ipcLinkedToggle) ipcLinkedToggle.checked = true;
    if (marginInput) marginInput.value = '1.0';
  } else {
    if (ipcLinkedToggle) ipcLinkedToggle.checked = true;
    if (marginInput) marginInput.value = '0.0';
  }
  updateWageSimulation();
}

function onCapToggleChange() {
  updateWageSimulation();
}

function updateCustomProposal() {
  updateWageSimulation();
}

function setCustomProposalPreset(presetKey) {
  const slider = document.getElementById('sim-custom-raise') || document.getElementById('custom-raise-slider');
  const raiseInput = document.getElementById('sim-custom-raise-input');
  const badge = document.getElementById('sim-custom-raise-badge') || document.getElementById('custom-raise-badge');
  const arrearsInput = document.getElementById('sim-custom-arrears') || document.getElementById('sim-custom-arrears-input') || document.getElementById('custom-arrears-input');
  const rsgModeSel = document.getElementById('sim-custom-rsg-mode') || document.getElementById('custom-rsg-mode');
  const ipcLinkedToggle = document.getElementById('sim-custom-ipc-linked');
  const marginInput = document.getElementById('sim-custom-rsg-margin');
  const capToggle = document.getElementById('sim-custom-cap-toggle');
  const capInput = document.getElementById('sim-custom-rsg-cap') || document.getElementById('custom-cap-mode');
  const ipcRate = parseFloat(document.getElementById('sim-ipc-rate')?.value || '2.5') / 100.0;

  if (presetKey === 'loss_zero') {
    const targetPct = (ipcRate * 100).toFixed(1);
    if (slider) slider.value = targetPct;
    if (raiseInput) raiseInput.value = targetPct;
    if (badge) badge.textContent = `${targetPct.replace('.', ',')}%`;
    if (arrearsInput) arrearsInput.value = '0';
    if (ipcLinkedToggle) ipcLinkedToggle.checked = true;
    if (rsgModeSel) rsgModeSel.value = 'ipc_100';
    if (marginInput) marginInput.value = '0.0';
    if (capToggle) capToggle.checked = false;
  } else if (presetKey === 'recovery_2030') {
    const reqPct = (solveRecoveryInitialRaise(0.118, 2030, 0.01) * 100).toFixed(1);
    if (slider) slider.value = reqPct;
    if (raiseInput) raiseInput.value = reqPct;
    if (badge) badge.textContent = `${reqPct.replace('.', ',')}%`;
    if (arrearsInput) arrearsInput.value = '5000';
    if (ipcLinkedToggle) ipcLinkedToggle.checked = true;
    if (rsgModeSel) rsgModeSel.value = 'ipc_margin';
    if (marginInput) marginInput.value = '1.0';
    if (capToggle) capToggle.checked = false;
  } else if (presetKey === 'equilibrium') {
    if (slider) slider.value = '8.0';
    if (raiseInput) raiseInput.value = '8.0';
    if (badge) badge.textContent = '8,0%';
    if (arrearsInput) arrearsInput.value = '4000';
    if (ipcLinkedToggle) ipcLinkedToggle.checked = true;
    if (rsgModeSel) rsgModeSel.value = 'ipc_100';
    if (marginInput) marginInput.value = '0.0';
    if (capToggle) capToggle.checked = true;
    if (capInput) capInput.value = '3.0';
  }
  updateWageSimulation();
}

function calculateSalaryProposals(baseSalary, ipcRate) {
  const w0 = Number(baseSalary) || 50000;
  const i = Number(ipcRate) || 0.025;
  const d = [1, 1 + i, Math.pow(1 + i, 2), Math.pow(1 + i, 3), Math.pow(1 + i, 4), Math.pow(1 + i, 5)];

  // 1. Company
  const co_ea_loss = w0 * 0.05 * 0.25;
  const co_w1 = (w0 * 1.05 - co_ea_loss);
  const co_w1_base = w0 * 1.05;
  const co_rate = Math.min(i * 0.25, 0.01);
  const co_w2_base = co_w1_base * (1 + co_rate);
  const co_w2 = co_w2_base + 2000;
  const co_w3 = co_w2_base * (1 + co_rate);
  const co_w4 = co_w3 * (1 + co_rate);
  const co_w5 = co_w4 * (1 + co_rate);
  const co_nom = [w0, co_w1, co_w2, co_w3, co_w4, co_w5];
  const co_real = co_nom.map((v, idx) => v / d[idx]);
  const co_cum_nom = [w0];
  for (let y = 1; y <= 5; y++) co_cum_nom.push(co_cum_nom[y - 1] + co_nom[y]);
  const co_cum_real = [w0];
  for (let y = 1; y <= 5; y++) co_cum_real.push(co_cum_real[y - 1] + co_real[y]);
  const co_total_nom = co_nom.slice(1).reduce((a, b) => a + b, 0);
  const co_total_real = co_real.slice(1).reduce((a, b) => a + b, 0);

  // 2. CGT
  const cgt_w1_base = w0 * 1.14;
  const cgt_w1 = cgt_w1_base + 8500;
  const cgt_rate = i + 0.02;
  const cgt_w2 = cgt_w1_base * (1 + cgt_rate);
  const cgt_w3 = cgt_w2 * (1 + cgt_rate);
  const cgt_w4 = cgt_w3 * (1 + cgt_rate);
  const cgt_w5 = cgt_w4 * (1 + cgt_rate);
  const cgt_nom = [w0, cgt_w1, cgt_w2, cgt_w3, cgt_w4, cgt_w5];
  const cgt_real = cgt_nom.map((v, idx) => v / d[idx]);
  const cgt_cum_nom = [w0];
  for (let y = 1; y <= 5; y++) cgt_cum_nom.push(cgt_cum_nom[y - 1] + cgt_nom[y]);
  const cgt_cum_real = [w0];
  for (let y = 1; y <= 5; y++) cgt_cum_real.push(cgt_cum_real[y - 1] + cgt_real[y]);
  const cgt_total_nom = cgt_nom.slice(1).reduce((a, b) => a + b, 0);
  const cgt_total_real = cgt_real.slice(1).reduce((a, b) => a + b, 0);

  // 3. Strike Committee (11 Points)
  const com_w1_base = w0 * 1.12;
  const com_w1 = com_w1_base + 7500;
  const com_rate = i + 0.015;
  const com_w2 = com_w1_base * (1 + com_rate);
  const com_w3 = com_w2 * (1 + com_rate);
  const com_w4 = com_w3 * (1 + com_rate);
  const com_w5 = com_w4 * (1 + com_rate);
  const com_nom = [w0, com_w1, com_w2, com_w3, com_w4, com_w5];
  const com_real = com_nom.map((v, idx) => v / d[idx]);
  const com_cum_nom = [w0];
  for (let y = 1; y <= 5; y++) com_cum_nom.push(com_cum_nom[y - 1] + com_nom[y]);
  const com_cum_real = [w0];
  for (let y = 1; y <= 5; y++) com_cum_real.push(com_cum_real[y - 1] + com_real[y]);
  const com_total_nom = com_nom.slice(1).reduce((a, b) => a + b, 0);
  const com_total_real = com_real.slice(1).reduce((a, b) => a + b, 0);

  // 4. Custom Proposal (Interactive Builder)
  const cState = getCustomProposalState();
  const cust_w1_base = w0 * (1.0 + cState.initialRaisePct / 100.0);
  const cust_w1 = cust_w1_base + cState.arrears;
  const cust_rate = evaluateAnnualRaise(i, cState.rsgMode, cState.rsgMargin, cState.rsgCap);
  const cust_w2 = cust_w1_base * (1 + cust_rate);
  const cust_w3 = cust_w2 * (1 + cust_rate);
  const cust_w4 = cust_w3 * (1 + cust_rate);
  const cust_w5 = cust_w4 * (1 + cust_rate);
  const cust_nom = [w0, cust_w1, cust_w2, cust_w3, cust_w4, cust_w5];
  const cust_real = cust_nom.map((v, idx) => v / d[idx]);
  const cust_cum_nom = [w0];
  for (let y = 1; y <= 5; y++) cust_cum_nom.push(cust_cum_nom[y - 1] + cust_nom[y]);
  const cust_cum_real = [w0];
  for (let y = 1; y <= 5; y++) cust_cum_real.push(cust_cum_real[y - 1] + cust_real[y]);
  const cust_total_nom = cust_nom.slice(1).reduce((a, b) => a + b, 0);
  const cust_total_real = cust_real.slice(1).reduce((a, b) => a + b, 0);

  return {
    company: { yearly_nom: co_nom, yearly_real: co_real, cum_nom: co_cum_nom, cum_real: co_cum_real, total_5yr_nom: co_total_nom, total_5yr_real: co_total_real, arrears: 2000 },
    cgt: { yearly_nom: cgt_nom, yearly_real: cgt_real, cum_nom: cgt_cum_nom, cum_real: cgt_cum_real, total_5yr_nom: cgt_total_nom, total_5yr_real: cgt_total_real, arrears: 8500, delta_vs_co_nom: cgt_total_nom - co_total_nom, delta_vs_co_real: cgt_total_real - co_total_real },
    strike_committee: { yearly_nom: com_nom, yearly_real: com_real, cum_nom: com_cum_nom, cum_real: com_cum_real, total_5yr_nom: com_total_nom, total_5yr_real: com_total_real, arrears: 7500, delta_vs_co_nom: com_total_nom - co_total_nom, delta_vs_co_real: com_total_real - co_total_real },
    custom: { yearly_nom: cust_nom, yearly_real: cust_real, cum_nom: cust_cum_nom, cum_real: cust_cum_real, total_5yr_nom: cust_total_nom, total_5yr_real: cust_total_real, arrears: cState.arrears, delta_vs_co_nom: cust_total_nom - co_total_nom, delta_vs_co_real: cust_total_real - co_total_real }
  };
}
// Shared helper: set textContent by id (safe no-op if element missing)
const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

function updateWageSimulation() {
  const salaryInput = document.getElementById('sim-salary');
  if (!salaryInput) return;
  const curSalary = parseFloat(salaryInput.value) || 50000;

  const badgeEl = document.getElementById('sim-salary-badge');
  if (badgeEl) badgeEl.textContent = `${curSalary.toLocaleString()} €`;

  const shift = document.getElementById('sim-shift')?.value || 'ordinaria';
  const quinquenios = parseInt(document.getElementById('sim-quinquenios')?.value || document.getElementById('sim-trienios')?.value || '1', 10);
  const teleworkDays = parseInt(document.getElementById('sim-telework')?.value || '2', 10);
  const strikeDays = parseInt(document.getElementById('sim-strike-days')?.value || '5', 10);
  const pensionRate = parseFloat(document.getElementById('sim-pension-rate')?.value || '4.5') / 100.0;
  const appliesEfectoAbril = document.getElementById('sim-efecto-abril')?.checked || false;
  const ipcRate = parseFloat(document.getElementById('sim-ipc-rate')?.value || '2.5') / 100.0;

  // Update IPC Audit Rate label
  setText('ipc-audit-rate-label', `${(ipcRate * 100).toFixed(1).replace('.', ',')}%`);

  // Seniority: approx 5.0% of base per quinquenio in Airbus
  const seniorityPct = quinquenios * 0.05;
  const curSeniority = curSalary * seniorityPct;

  // Shift plus rates
  let shiftPct = 0.0;
  if (shift === 'turnos_2') shiftPct = 0.08;
  else if (shift === 'turnos_3') shiftPct = 0.18;
  else if (shift === 'quinto_turno') shiftPct = 0.25;
  const curShiftPlus = curSalary * shiftPct;

  const curPension = curSalary * pensionRate;
  const curTotalPackage = curSalary + curSeniority + curShiftPlus + curPension;

  // Estimated effective tax rate (IRPF + SS)
  let taxRate = 0.26;
  if (curSalary > 65000) taxRate = 0.33;
  else if (curSalary > 45000) taxRate = 0.28;
  else if (curSalary < 32000) taxRate = 0.21;

  // --- EFECTO ABRIL ACTUARIAL CALCULATIONS ---
  // Base annual raise under Union Platform (12%)
  const unionAnnualGrossRaise = curSalary * 0.12;
  const eaLossQ1Gross = unionAnnualGrossRaise * 0.25; // 3 months (Jan-Mar)
  const eaLossJuneExtraGross = (unionAnnualGrossRaise / 14.0) * 0.5; // June extra pay reduced devengo (3/6 months)
  const eaUnionPensionRate = Math.max(pensionRate, 0.055);
  const eaLossPensionGross = ((curSalary * 1.12 * eaUnionPensionRate) - curPension) * 0.25;
  const eaTotalIndividualGross = eaLossQ1Gross + eaLossJuneExtraGross + eaLossPensionGross;
  const eaTotalIndividualNet = eaTotalIndividualGross * (1 - taxRate);
  const totalWorkers = conflictData?.parameters?.total_workers_spain || 15562;
  const eaTotalAirbusSavedM = (eaTotalIndividualGross * totalWorkers) / 1e6;

  // Update Efecto Abril Audit Panel Metrics
  setText('ea-loss-q1', `-${Math.round(eaLossQ1Gross).toLocaleString()} €`);
  setText('ea-loss-extra', `-${Math.round(eaLossJuneExtraGross).toLocaleString()} €`);
  setText('ea-loss-pension', `-${Math.round(eaLossPensionGross).toLocaleString()} €`);
  setText('ea-loss-total-airbus', `-${eaTotalAirbusSavedM.toFixed(1)} M€`);

  // --- SCENARIO 1: OFERTA EMPRESA (+5% fraccionado, 2.000 € paga única, 0% teletrabajo, no Bradford, con Efecto Abril aplicado) ---
  const coBaseSalary = curSalary * 1.05;
  const coMonthlyIncrease = (coBaseSalary - curSalary) / 14.0;
  const coArrears = 2000;
  const coSeniority = coBaseSalary * seniorityPct;
  const coShiftPlus = coBaseSalary * shiftPct;
  const coPension = coBaseSalary * pensionRate;
  const coTelework = 0;
  const coBradford = 0;
  // Company offer inherently applies April effect (losing Q1 of the 5%)
  const coEaLossQ1 = (coBaseSalary - curSalary) * 0.25;
  const coNetTotalGain = ((coBaseSalary - curSalary) * (1 - taxRate)) - (coEaLossQ1 * (1 - taxRate)) + (coArrears * (1 - taxRate)) + (coPension - curPension) + (coSeniority - curSeniority) + (coShiftPlus - curShiftPlus);

  // 5-Year Macro Trajectory for Company Offer:
  // Year 1 (2026): coBaseSalary - coEaLossQ1
  // Years 2-5: Weak company clause (max 1% annual or 0% real RSG)
  const coNomYear1 = coBaseSalary - coEaLossQ1;
  const coNomYear5 = coNomYear1 * Math.pow(1 + Math.min(ipcRate * 0.25, 0.01), 4);
  const cumDeflator4yr = Math.pow(1 + ipcRate, 4);
  const cumInflation4yr = cumDeflator4yr - 1;
  const coRealYear5 = coNomYear5 / cumDeflator4yr;
  const coRealLossPct = ((coRealYear5 / curSalary) - 1) * 100;
  const coRealLossAmt = coRealYear5 - curSalary;

  // --- SCENARIO 2: PLATAFORMA DEL COMITÉ (+12% íntegro, 7.500 € atrasos, 5.5% pensiones, Bradford refund, 60€/m teletrabajo, RSG = IPC + 1.5% sin techo) ---
  const unionBaseSalary = curSalary * 1.12;
  const unionMonthlyIncrease = (unionBaseSalary - curSalary) / 14.0;
  const unionArrears = 7500;
  const unionSeniority = unionBaseSalary * seniorityPct;
  const unionShiftPlus = unionBaseSalary * shiftPct;
  const unionPensionRate = Math.max(pensionRate, 0.055);
  const unionPension = unionBaseSalary * unionPensionRate;
  const unionTelework = teleworkDays > 0 ? (teleworkDays >= 2 ? 720 : 360) : 0;
  const unionBradford = curSalary > 45000 ? 850 : 600;

  // If toggle applies Efecto Abril, deduct the individual loss
  const activeUnionEaDeductionNet = appliesEfectoAbril ? eaTotalIndividualNet : 0;
  const activeUnionEaDeductionGross = appliesEfectoAbril ? eaTotalIndividualGross : 0;

  const unionNetTotalGain = (unionBaseSalary - curSalary) * (1 - taxRate) + (unionArrears * (1 - taxRate)) + (unionPension - curPension) + (unionSeniority - curSeniority) + (unionShiftPlus - curShiftPlus) + unionTelework + unionBradford - activeUnionEaDeductionNet;

  // 5-Year Macro Trajectory for Committee Platform:
  // Annual update = IPC + 1.5% RSG
  const unionNomYear1 = unionBaseSalary - activeUnionEaDeductionGross;
  const unionNomYear5 = unionNomYear1 * Math.pow(1 + ipcRate + 0.015, 4);
  const unionRealYear5 = unionNomYear5 / cumDeflator4yr;
  const unionRealGainPct = ((unionRealYear5 / curSalary) - 1) * 100;
  const unionRealGainAmt = unionRealYear5 - curSalary;

  // --- SCENARIO 3: TU PROPUESTA PERSONALIZADA (Constructor Interactivo) ---
  const cState = getCustomProposalState();
  const custBaseSalary = curSalary * (1.0 + cState.initialRaisePct / 100.0);
  const custMonthlyIncrease = (custBaseSalary - curSalary) / 14.0;
  const custArrears = cState.arrears;
  const custSeniority = custBaseSalary * seniorityPct;
  const custShiftPlus = custBaseSalary * shiftPct;
  const custPension = custBaseSalary * (pensionRate + 0.005);
  const custTelework = teleworkDays > 0 ? (teleworkDays * 18 * 12) : 0;
  const custBradford = curSalary > 45000 ? 600 : 400;
  const custNetTotalGain = (custBaseSalary - curSalary) * (1 - taxRate) + (custArrears * (1 - taxRate)) + (custPension - curPension) + (custSeniority - curSeniority) + (custShiftPlus - curShiftPlus) + custTelework + custBradford;

  const custAnnualRate = evaluateAnnualRaise(ipcRate, cState.rsgMode, cState.rsgMargin, cState.rsgCap);
  const custNomYear1 = custBaseSalary;
  const custNomYear5 = custNomYear1 * Math.pow(1 + custAnnualRate, 4);
  const custRealYear5 = custNomYear5 / cumDeflator4yr;
  const custRealGainPct = ((custRealYear5 / curSalary) - 1) * 100;
  const custRealGainAmt = custRealYear5 - curSalary;

  // Current Baseline 5-Year Real Trajectory:
  const curNomYear5 = curSalary;
  const curRealYear5 = curSalary / cumDeflator4yr;
  const curRealLossPct = ((curRealYear5 / curSalary) - 1) * 100;

  // --- UPDATE IPC AUDIT PANEL METRICS ---
  const coLossSign = coRealLossAmt >= 0 ? '+' : '';
  setText('ipc-audit-loss-co', `${coRealLossPct.toFixed(1).replace('.', ',')}% (${coLossSign}${Math.round(coRealLossAmt).toLocaleString()} €)`);
  setText('ipc-audit-gain-union', `+${unionRealGainPct.toFixed(1).replace('.', ',')}% (+${Math.round(unionRealGainAmt).toLocaleString()} €)`);
  setText('ipc-audit-cum-inflation', `+${(cumInflation4yr * 100).toFixed(1).replace('.', ',')}%`);
  setText('ipc-audit-gap-5yr', `+${Math.round(unionNomYear5 - coNomYear5).toLocaleString()} €/año`);

  // --- ROI OF STRIKE ---
  // Daily net salary: (Gross / 14 / 22 working days) * (1 - taxRate)
  const dailyNet = (curSalary / 14.0 / 22.0) * (1 - taxRate);
  const totalStrikeCost = dailyNet * strikeDays;
  const netMonthlyGainInPocket = (unionMonthlyIncrease) * (1 - taxRate);
  const amortizationMonths = netMonthlyGainInPocket > 0 ? (totalStrikeCost / netMonthlyGainInPocket) : 0.0;
  const gain5Years = ((unionBaseSalary - curSalary) * 5 * (1 - taxRate)) + (unionArrears * (1 - taxRate)) + ((unionPension - curPension) * 5) + ((unionSeniority - curSeniority) * 5) + (unionTelework * 5) + unionBradford - totalStrikeCost - activeUnionEaDeductionNet;

  // Net Monthly Increases (14 payments, after IRPF + SS)
  const coNetMonthlyIncrease = coMonthlyIncrease * (1 - taxRate);
  const unionNetMonthlyIncrease = unionMonthlyIncrease * (1 - taxRate);
  const custNetMonthlyIncrease = custMonthlyIncrease * (1 - taxRate);

  // --- SCENARIO 1 (Empresa) UI ---
  setText('sc1-salary-y1', `${Math.round(coBaseSalary).toLocaleString()} €`);
  setText('sc1-monthly', `+${Math.round(coNetMonthlyIncrease).toLocaleString()} €/mes`);
  setText('sc1-real-5yr', `${Math.round(coRealYear5).toLocaleString()} € (${coRealLossPct.toFixed(1).replace('.', ',')}%)`);
  setText('sc1-loss-badge', `${coRealLossPct.toFixed(1).replace('.', ',')}%`);
  setText('sc1-net-total', `+${Math.round(coNetTotalGain).toLocaleString()} €`);

  // --- SCENARIO 2 (Comité +12%) UI ---
  setText('sc2-salary-y1', `${Math.round(unionBaseSalary).toLocaleString()} €`);
  setText('sc2-monthly', `+${Math.round(unionNetMonthlyIncrease).toLocaleString()} €/mes`);
  setText('sc2-real-5yr', `${Math.round(unionRealYear5).toLocaleString()} € (+${unionRealGainPct.toFixed(1).replace('.', ',')}%)`);
  setText('sc2-gain-badge', `+${unionRealGainPct.toFixed(1).replace('.', ',')}%`);
  setText('sc2-net-total', `+${Math.round(unionNetTotalGain).toLocaleString()} €`);

  // --- SCENARIO 3 (Tu Propuesta) UI ---
  const custGainSign = custRealGainPct >= 0 ? '+' : '';
  setText('sc3-salary-y1', `${Math.round(custBaseSalary).toLocaleString()} €`);
  setText('sc3-monthly', `+${Math.round(custNetMonthlyIncrease).toLocaleString()} €/mes`);
  setText('sc3-real-5yr', `${Math.round(custRealYear5).toLocaleString()} € (${custGainSign}${custRealGainPct.toFixed(1).replace('.', ',')}%)`);
  setText('sc3-gain-badge', `${custGainSign}${custRealGainPct.toFixed(1).replace('.', ',')}%`);
  setText('sc3-net-total', `+${Math.round(custNetTotalGain).toLocaleString()} €`);
  // Legacy fallbacks for compatibility
  setText('scen-co-salary', `${Math.round(coBaseSalary).toLocaleString()} €`);
  setText('scen-co-salary-5yr', `${Math.round(coNomYear5).toLocaleString()} €`);
  setText('scen-co-real-5yr', `${Math.round(coRealYear5).toLocaleString()} € (${coRealLossPct.toFixed(1).replace('.', ',')}%)`);
  setText('scen-co-loss-badge', `${coRealLossPct.toFixed(1).replace('.', ',')}%`);
  setText('scen-co-monthly', `+${Math.round(coMonthlyIncrease).toLocaleString()} €/mes`);
  setText('scen-co-net-monthly', `+${Math.round(coNetMonthlyIncrease).toLocaleString()} €/mes`);
  setText('scen-co-net-total', `+${Math.round(coNetTotalGain).toLocaleString()} €`);
  setText('scen-med-salary', `${Math.round(medBaseSalary).toLocaleString()} €`);
  setText('scen-med-salary-5yr', `${Math.round(medNomYear5).toLocaleString()} €`);
  setText('scen-med-real-5yr', `${Math.round(medRealYear5).toLocaleString()} € (+${medRealGainPct.toFixed(1).replace('.', ',')}%)`);
  setText('scen-med-monthly', `+${Math.round(medMonthlyIncrease).toLocaleString()} €/mes`);
  setText('scen-med-net-monthly', `+${Math.round(medNetMonthlyIncrease).toLocaleString()} €/mes`);
  setText('scen-med-net-total', `+${Math.round(medNetTotalGain).toLocaleString()} €`);
  setText('scen-union-salary', `${Math.round(unionBaseSalary).toLocaleString()} €`);
  setText('scen-union-salary-5yr', `${Math.round(unionNomYear5).toLocaleString()} €`);
  setText('scen-union-real-5yr', `${Math.round(unionRealYear5).toLocaleString()} € (+${unionRealGainPct.toFixed(1).replace('.', ',')}%)`);
  setText('scen-union-gain-badge', `+${unionRealGainPct.toFixed(1).replace('.', ',')}%`);
  setText('scen-union-monthly', `+${Math.round(unionMonthlyIncrease).toLocaleString()} €/mes`);
  setText('scen-union-net-monthly', `+${Math.round(unionNetMonthlyIncrease).toLocaleString()} €/mes`);
  setText('scen-union-net-total', `+${Math.round(unionNetTotalGain).toLocaleString()} €`);
  // Update Breakdown Table
  setText('tb-base-cur', `${Math.round(curSalary).toLocaleString()} €`);
  setText('tb-base-co', `${Math.round(coBaseSalary).toLocaleString()} €`);
  setText('tb-base-union', `${Math.round(unionBaseSalary).toLocaleString()} €`);
  setText('tb-base-diff', `+${Math.round(unionBaseSalary - curSalary).toLocaleString()} €/año`);

  setText('tb-month-cur', `${Math.round(curSalary / 14.0).toLocaleString()} €`);
  setText('tb-month-co', `${Math.round(coBaseSalary / 14.0).toLocaleString()} €`);
  setText('tb-month-union', `${Math.round(unionBaseSalary / 14.0).toLocaleString()} €`);
  setText('tb-month-diff', `+${Math.round(unionMonthlyIncrease).toLocaleString()} €/mes`);

  // Net Monthly Payroll (14 payments)
  const curNetMonth = (curSalary / 14.0) * (1 - taxRate);
  const coNetMonth = (coBaseSalary / 14.0) * (1 - taxRate);
  const unionNetMonth = (unionBaseSalary / 14.0) * (1 - taxRate);
  setText('tb-month-net-cur', `${Math.round(curNetMonth).toLocaleString()} €`);
  setText('tb-month-net-co', `${Math.round(coNetMonth).toLocaleString()} €`);
  setText('tb-month-net-union', `${Math.round(unionNetMonth).toLocaleString()} €`);
  setText('tb-month-net-diff', `+${Math.round(unionNetMonthlyIncrease).toLocaleString()} €/mes netos`);
  setText('tb-pen-cur', `${Math.round(curPension).toLocaleString()} €`);
  setText('tb-pen-co', `${Math.round(coPension).toLocaleString()} €`);
  setText('tb-pen-union', `${Math.round(unionPension).toLocaleString()} €`);
  setText('tb-pen-diff', `+${Math.round(unionPension - curPension).toLocaleString()} €/año`);

  setText('tb-plus-cur', `${Math.round(curSeniority + curShiftPlus).toLocaleString()} €`);
  setText('tb-plus-co', `${Math.round(coSeniority + coShiftPlus).toLocaleString()} €`);
  setText('tb-plus-union', `${Math.round(unionSeniority + unionShiftPlus).toLocaleString()} €`);
  setText('tb-plus-diff', `+${Math.round((unionSeniority + unionShiftPlus) - (curSeniority + curShiftPlus)).toLocaleString()} €/año`);

  setText('tb-tele-union', `${unionTelework.toLocaleString()} €`);
  setText('tb-tele-diff', `+${unionTelework.toLocaleString()} €/año`);

  // Efecto Abril table row
  setText('tb-ea-co', `-${Math.round(coEaLossQ1).toLocaleString()} €`);
  if (appliesEfectoAbril) {
    setText('tb-ea-union', `-${Math.round(eaTotalIndividualGross).toLocaleString()} € (Efecto Abril)`);
    setText('tb-ea-diff', `-${Math.round(eaTotalIndividualGross - coEaLossQ1).toLocaleString()} €`);
  } else {
    setText('tb-ea-union', `0 € (100% Retroactivo)`);
    setText('tb-ea-diff', `+${Math.round(coEaLossQ1).toLocaleString()} € blindados`);
  }

  const totalCurYear1 = curSalary + curSeniority + curShiftPlus + curPension;
  const totalCoYear1 = coBaseSalary + coSeniority + coShiftPlus + coPension + coArrears - coEaLossQ1;
  const totalUnionYear1 = unionBaseSalary + unionSeniority + unionShiftPlus + unionPension + unionArrears + unionTelework + unionBradford - activeUnionEaDeductionGross;

  setText('tb-tot-cur', `${Math.round(totalCurYear1).toLocaleString()} €`);
  setText('tb-tot-co', `${Math.round(totalCoYear1).toLocaleString()} €`);
  setText('tb-tot-union', `${Math.round(totalUnionYear1).toLocaleString()} €`);
  setText('tb-tot-diff', `+${Math.round(totalUnionYear1 - totalCurYear1).toLocaleString()} €`);
  // Net Total Benefit in Pocket
  setText('tb-net-tot-cur', `0 €`);
  setText('tb-net-tot-co', `+${Math.round(coNetTotalGain).toLocaleString()} €`);
  setText('tb-net-tot-union', `+${Math.round(unionNetTotalGain).toLocaleString()} €`);
  setText('tb-net-tot-diff', `+${Math.round(unionNetTotalGain - coNetTotalGain).toLocaleString()} € más`);

  // 5-Year Inflation Projection Table Rows
  setText('tb-5yr-cur-nom', `${Math.round(curNomYear5).toLocaleString()} €`);
  setText('tb-5yr-co-nom', `${Math.round(coNomYear5).toLocaleString()} €`);
  setText('tb-5yr-union-nom', `${Math.round(unionNomYear5).toLocaleString()} €`);
  setText('tb-5yr-diff-nom', `+${Math.round(unionNomYear5 - coNomYear5).toLocaleString()} €/año`);

  setText('tb-5yr-cur-real', `${Math.round(curRealYear5).toLocaleString()} € (${curRealLossPct.toFixed(1).replace('.', ',')}%)`);
  setText('tb-5yr-co-real', `${Math.round(coRealYear5).toLocaleString()} € (${coRealLossPct.toFixed(1).replace('.', ',')}%)`);
  setText('tb-5yr-union-real', `${Math.round(unionRealYear5).toLocaleString()} € (+${unionRealGainPct.toFixed(1).replace('.', ',')}%)`);
  setText('tb-5yr-diff-real', `+${Math.round(unionRealYear5 - coRealYear5).toLocaleString()} € real`);

  // Multi-Proposal 5-Year Simulation Metrics (Company vs CGT vs Strike Committee)
  const props = calculateSalaryProposals(curSalary, ipcRate);

  // 1. Empresa
  setText('tb-prop-co-y1-nom', `${Math.round(props.company.yearly_nom[1]).toLocaleString()} €`);
  setText('tb-prop-co-y5-nom', `${Math.round(props.company.yearly_nom[5]).toLocaleString()} €`);
  setText('tb-prop-co-y5-real', `${Math.round(props.company.yearly_real[5]).toLocaleString()} €`);
  setText('tb-prop-co-5yr-tot', `${Math.round(props.company.total_5yr_nom).toLocaleString()} €`);

  // 2. CGT (Plataforma Asamblearia)
  setText('tb-prop-cgt-y1-nom', `${Math.round(props.cgt.yearly_nom[1]).toLocaleString()} €`);
  setText('tb-prop-cgt-y5-nom', `${Math.round(props.cgt.yearly_nom[5]).toLocaleString()} €`);
  setText('tb-prop-cgt-y5-real', `${Math.round(props.cgt.yearly_real[5]).toLocaleString()} €`);
  setText('tb-prop-cgt-5yr-tot', `${Math.round(props.cgt.total_5yr_nom).toLocaleString()} €`);
  setText('tb-prop-cgt-diff', `+${Math.round(props.cgt.delta_vs_co_nom).toLocaleString()} €`);

  // 3. Comité de Huelga (11 Puntos SIMA)
  setText('tb-prop-comite-y1-nom', `${Math.round(props.strike_committee.yearly_nom[1]).toLocaleString()} €`);
  setText('tb-prop-comite-y5-nom', `${Math.round(props.strike_committee.yearly_nom[5]).toLocaleString()} €`);
  setText('tb-prop-comite-y5-real', `${Math.round(props.strike_committee.yearly_real[5]).toLocaleString()} €`);
  setText('tb-prop-comite-5yr-tot', `${Math.round(props.strike_committee.total_5yr_nom).toLocaleString()} €`);
  setText('tb-prop-comite-diff', `+${Math.round(props.strike_committee.delta_vs_co_nom).toLocaleString()} €`);

  // Differential KPI Cards
  setText('kpi-diff-cgt-5yr', `+${Math.round(props.cgt.delta_vs_co_nom).toLocaleString()} €`);
  setText('kpi-diff-cgt-5yr-real', `+${Math.round(props.cgt.delta_vs_co_real).toLocaleString()} € reales`);
  setText('kpi-diff-comite-5yr', `+${Math.round(props.strike_committee.delta_vs_co_nom).toLocaleString()} €`);
  setText('kpi-diff-comite-5yr-real', `+${Math.round(props.strike_committee.delta_vs_co_real).toLocaleString()} € reales`);
  setText('kpi-diff-custom-5yr', `+${Math.round(props.custom.delta_vs_co_nom).toLocaleString()} €`);
  setText('kpi-diff-custom-5yr-real', `+${Math.round(props.custom.delta_vs_co_real).toLocaleString()} € reales`);
  setText('kpi-diff-sima-5yr', `+${Math.round(props.custom.delta_vs_co_nom).toLocaleString()} €`);
  setText('kpi-diff-sima-5yr-real', `+${Math.round(props.custom.delta_vs_co_real).toLocaleString()} € reales`);
  // Update Strike ROI
  setText('roi-strike-days-label', `${strikeDays} días`);
  setText('roi-strike-cost', `-${Math.round(totalStrikeCost).toLocaleString()} € netos`);
  setText('roi-monthly-gain', `+${Math.round(unionNetMonthlyIncrease).toLocaleString()} € netos/mes`);
  setText('roi-amortization-time', strikeDays === 0 ? '0 días' : `${amortizationMonths.toFixed(1)} meses (${Math.round(amortizationMonths * 4.3)} semanas)`);
  setText('roi-5yr-gain', `+${Math.round(gain5Years).toLocaleString()} €`);
  // Sync URL so the current simulation is shareable
  syncSimulatorURL(curSalary, document.getElementById('sim-shift')?.value || 'ordinaria',
    strikeDays, quinquenios, pensionRate * 100, ipcRate * 100);

  // Update Charts
  updateSalaryEvolutionChart(curSalary, ipcRate);
  updateWagesChart(curSalary, ipcRate);
}

// ==================== SIMULATOR SHARE & EXPORT ====================
function syncSimulatorURL(salary, shift, days, quinquenios, pension, ipc) {
  const params = new URLSearchParams(window.location.search);
  params.set('salary', salary);
  params.set('shift', shift);
  params.set('days', days);
  params.set('q', quinquenios);
  params.set('pension', pension);
  params.set('ipc', ipc);
  const newUrl = `${location.pathname}#tab-purchasing-power?${params.toString()}`;
  history.replaceState(null, '', newUrl);
}

function shareSimulatorURL() {
  const url = location.href;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('🔗 Vínculo del simulador copiado al portapapeles. ¡Compártelo en Telegram!', 'sky');
    });
  } else {
    // fallback for non-secure contexts
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('🔗 Vínculo copiado al portapapeles.', 'sky');
  }
}

function copySimulatorResult() {
  const salary = parseFloat(document.getElementById('sim-salary')?.value || 50000).toLocaleString();
  const shift = document.getElementById('sim-shift')?.value || 'ordinaria';
  const days = document.getElementById('sim-strike-days')?.value || '5';
  const q = document.getElementById('sim-quinquenios')?.value || '1';

  const getText = id => document.getElementById(id)?.textContent?.trim() || '-';
  const lines = [
    `📊 *SIMULADOR SALARIAL — AIRBUS SPAIN 2026*`,
    `Salario bruto: ${salary} € | Turno: ${shift} | Huelga: ${days} días | Quinquenios: ${q}`,
    ``,
    `📌 Oferta Empresa (+5%):`,
    `  • Ganancia neta: ${getText('result-co-gain')}`,
    `  • Mensual en nómina: ${getText('result-co-monthly')}`,
    ``,
    `📌 Preacuerdo SIMA (+9,5%):`,
    `  • Ganancia neta: ${getText('result-med-gain')}`,
    `  • Mensual en nómina: ${getText('result-med-monthly')}`,
    ``,
    `📌 Plataforma Comité (+12%):`,
    `  • Ganancia neta: ${getText('result-union-gain')}`,
    `  • Mensual en nómina: ${getText('result-union-monthly')}`,
    ``,
    `⏱ ROI Huelga: ${getText('roi-amortization-time')} para amortizar ${days} días de paro`,
    `💶 Ganancia neta 5 años: ${getText('roi-5yr-gain')}`,
    ``,
    `🔗 Simulación completa: ${location.href}`
  ].join('\n');

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(lines).then(() => {
      showToast('📋 Resultado copiado al portapapeles en formato Telegram.', 'emerald');
    });
  } else {
    const ta = document.createElement('textarea');
    ta.value = lines;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('📋 Resultado copiado.', 'emerald');
  }
}

function restoreSimulatorFromURL() {
  // Params may be after a hash: parse manually
  const raw = location.href;
  const qi = raw.indexOf('?');
  if (qi === -1) return;
  const params = new URLSearchParams(raw.slice(qi + 1));

  const salary = params.get('salary');
  const shift  = params.get('shift');
  const days   = params.get('days');
  const q      = params.get('q');
  const pension= params.get('pension');
  const ipc    = params.get('ipc');

  if (!salary) return; // nothing to restore

  if (salary) { const el = document.getElementById('sim-salary'); if (el) el.value = salary; }
  if (shift)  { const el = document.getElementById('sim-shift');  if (el) el.value = shift; }
  if (days)   { const el = document.getElementById('sim-strike-days'); if (el) el.value = days; }
  if (q)      { const el = document.getElementById('sim-quinquenios'); if (el) el.value = q; }
  if (pension){ const el = document.getElementById('sim-pension-rate'); if (el) el.value = pension; }
  if (ipc)    { const el = document.getElementById('sim-ipc-rate'); if (el) el.value = ipc; }

  // Navigate to the simulator tab
  switchTab('tab-purchasing-power');
  updateWageSimulation();
  showToast('🔄 Simulación restaurada desde el vínculo compartido.', 'sky');
}
function initSalaryEvolutionChart() {
  salaryEvolutionChart = renderResilientChart('salaryEvolutionChart', () => ({
    type: 'line',
    data: {
      labels: ['2025 (Base)', '2026 (Año 1)', '2027 (Año 2)', '2028 (Año 3)', '2029 (Año 4)', '2030 (Año 5)'],
      datasets: [
        {
          label: 'Plataforma Comité (+12% + RSG IPC+1,5%)',
          data: [50000, 56000, 58240, 60570, 62992, 65512],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: false,
          borderWidth: 3,
          tension: 0.2,
          pointRadius: 4,
          pointBackgroundColor: '#10b981'
        },
        {
          label: 'Tu Propuesta Personalizada',
          data: [50000, 54000, 55350, 56733, 58152, 59605],
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          fill: false,
          borderWidth: 2.5,
          tension: 0.2,
          pointRadius: 4,
          pointBackgroundColor: '#38bdf8'
        },
        {
          label: 'Oferta Empresa (+5% Fraccionado, Techo 1%)',
          data: [50000, 52500, 53025, 53555, 54091, 54632],
          borderColor: '#f43f5e',
          borderDash: [5, 4],
          borderWidth: 2.5,
          tension: 0.2,
          pointRadius: 3,
          pointBackgroundColor: '#f43f5e',
          fill: false
        },
        {
          label: 'Poder de Compra Real (Sin Blindaje IPC)',
          data: [50000, 51220, 49970, 48751, 47562, 46402],
          borderColor: '#64748b',
          backgroundColor: 'rgba(100, 116, 139, 0.12)',
          borderDash: [2, 2],
          borderWidth: 1.5,
          tension: 0.1,
          pointRadius: 2,
          pointBackgroundColor: '#64748b',
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        y: {
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: {
            color: '#94a3b8',
            callback: v => `${(v/1000).toFixed(0)}k €`
          },
          title: {
            display: true,
            text: 'Salario Bruto Anual (€/año)',
            color: '#94a3b8',
            font: { size: 10, weight: 'bold' }
          }
        },
        x: {
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: { color: '#e2e8f0', font: { weight: 'bold', size: 11 } }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#cbd5e1', font: { size: 10.5, weight: 'bold' } }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#38bdf8',
          bodyColor: '#f8fafc',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              return ` ${context.dataset.label}: ${Math.round(context.raw).toLocaleString()} €/año`;
            }
          }
        }
      }
    }
  }));
}

function updateSalaryEvolutionChart(curSalary, ipcRate = 0.025) {
  if (!salaryEvolutionChart) return;
  const y0 = curSalary;
  // Scenario 3: Union (+12%, then IPC + 1.5% annually)
  const u1 = curSalary * 1.12;
  const u2 = u1 * (1 + ipcRate + 0.015);
  const u3 = u2 * (1 + ipcRate + 0.015);
  const u4 = u3 * (1 + ipcRate + 0.015);
  const u5 = u4 * (1 + ipcRate + 0.015);
  const unionData = [y0, u1, u2, u3, u4, u5];

  // Scenario 3: Custom Proposal
  const cState = getCustomProposalState();
  const custAnnualRate = evaluateAnnualRaise(ipcRate, cState.rsgMode, cState.rsgMargin, cState.rsgCap);
  const cust1 = curSalary * (1.0 + cState.initialRaisePct / 100.0);
  const cust2 = cust1 * (1 + custAnnualRate);
  const cust3 = cust2 * (1 + custAnnualRate);
  const cust4 = cust3 * (1 + custAnnualRate);
  const cust5 = cust4 * (1 + custAnnualRate);
  const customData = [y0, cust1, cust2, cust3, cust4, cust5];

  // Scenario 1: Company (+5%, then min(ipc*0.25, 0.01))
  const c1 = curSalary * 1.05;
  const cRate = Math.min(ipcRate * 0.25, 0.01);
  const c2 = c1 * (1 + cRate);
  const c3 = c2 * (1 + cRate);
  const c4 = c3 * (1 + cRate);
  const c5 = c4 * (1 + cRate);
  const companyData = [y0, c1, c2, c3, c4, c5];

  // Real Deflated Value of Company Offer without RSG
  const r1 = c1 / (1 + ipcRate);
  const r2 = c2 / Math.pow(1 + ipcRate, 2);
  const r3 = c3 / Math.pow(1 + ipcRate, 3);
  const r4 = c4 / Math.pow(1 + ipcRate, 4);
  const r5 = c5 / Math.pow(1 + ipcRate, 5);
  const realData = [y0, r1, r2, r3, r4, r5];

  salaryEvolutionChart.data.datasets[0].data = unionData.map(Math.round);
  salaryEvolutionChart.data.datasets[1].data = customData.map(Math.round);
  salaryEvolutionChart.data.datasets[2].data = companyData.map(Math.round);
  salaryEvolutionChart.data.datasets[3].data = realData.map(Math.round);
  salaryEvolutionChart.update('none');
}

function initWagesChart() {
  wagesChart = renderResilientChart('wagesChart', () => ({
    type: 'line',
    data: {
      labels: ['2025 (Base)', '2026 (Año 1)', '2027 (Año 2)', '2028 (Año 3)', '2029 (Año 4)', '2030 (Año 5)'],
      datasets: [
        {
          label: 'Plataforma CGT (+14% + 8.5k€ Atrasos + IPC+2% RSG)',
          data: [50000, 115500, 175065, 237310, 302357, 370330],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          fill: true,
          borderWidth: 3,
          tension: 0.2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#10b981'
        },
        {
          label: 'Comité de Huelga 11 Puntos (+12% + 7.5k€ Atrasos + IPC+1.5% RSG)',
          data: [50000, 113500, 171740, 232310, 295302, 360814],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.05)',
          fill: false,
          borderWidth: 3,
          tension: 0.2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#f59e0b'
        },
        {
          label: 'Tu Propuesta Personalizada (Atrasos + RSG a Medida)',
          data: [50000, 108000, 163350, 220083, 278235, 337841],
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          fill: false,
          borderWidth: 2.5,
          tension: 0.2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#38bdf8'
        },
        {
          label: 'Oferta Empresa (+5% Fraccionado + Paga Única 2k€ + Techo 1%)',
          data: [50000, 101875, 156703, 209861, 263352, 317177],
          borderColor: '#f43f5e',
          borderDash: [5, 4],
          borderWidth: 2.5,
          tension: 0.2,
          pointRadius: 3,
          pointBackgroundColor: '#f43f5e',
          fill: false
        },
        {
          label: 'Sin Huelga / Congelación (Poder Real Deflactado por IPC)',
          data: [50000, 97500, 142800, 187000, 230100, 272000],
          borderColor: '#64748b',
          borderDash: [2, 2],
          borderWidth: 1.5,
          tension: 0.1,
          pointRadius: 2,
          pointBackgroundColor: '#64748b',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        y: {
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: {
            color: '#94a3b8',
            callback: v => `${(v/1000).toFixed(0)}k €`
          },
          title: {
            display: true,
            text: 'Ingresos Acumulados Brutos (€)',
            color: '#94a3b8',
            font: { size: 10, weight: 'bold' }
          }
        },
        x: {
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: { color: '#e2e8f0', font: { weight: 'bold', size: 11 } }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#cbd5e1', font: { size: 10.5, weight: 'bold' } }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#38bdf8',
          bodyColor: '#f8fafc',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              return ` ${context.dataset.label}: ${Math.round(context.raw).toLocaleString()} € acumulados`;
            }
          }
        }
      }
    }
  }));
}

function updateWagesChart(curSalary, ipcRate = 0.025) {
  if (!wagesChart) return;
  const props = calculateSalaryProposals(curSalary, ipcRate);
  
  // Real deflated baseline without agreement
  const y0 = curSalary;
  const cumDeflator1 = 1 + ipcRate;
  const cumDeflator2 = Math.pow(1 + ipcRate, 2);
  const cumDeflator3 = Math.pow(1 + ipcRate, 3);
  const cumDeflator4 = Math.pow(1 + ipcRate, 4);
  const cumDeflator5 = Math.pow(1 + ipcRate, 5);

  const base_cum_real_y1 = y0 + (curSalary / cumDeflator1);
  const base_cum_real_y2 = base_cum_real_y1 + (curSalary / cumDeflator2);
  const base_cum_real_y3 = base_cum_real_y2 + (curSalary / cumDeflator3);
  const base_cum_real_y4 = base_cum_real_y3 + (curSalary / cumDeflator4);
  const base_cum_real_y5 = base_cum_real_y4 + (curSalary / cumDeflator5);
  const base_cum_real = [y0, base_cum_real_y1, base_cum_real_y2, base_cum_real_y3, base_cum_real_y4, base_cum_real_y5];

  wagesChart.data.datasets[0].data = props.cgt.cum_nom.map(Math.round);
  wagesChart.data.datasets[1].data = props.strike_committee.cum_nom.map(Math.round);
  wagesChart.data.datasets[2].data = props.custom.cum_nom.map(Math.round);
  wagesChart.data.datasets[3].data = props.company.cum_nom.map(Math.round);
  wagesChart.data.datasets[4].data = base_cum_real.map(Math.round);
  wagesChart.update('none');
}

// ==================== STOCK MARKET & SHARE PRICE CHART ====================
function renderStockMilestones(stockData) {
  const container = document.getElementById('stock-milestones-container');
  if (!container || !stockData || stockData.length === 0) return;

  const peakPrice = stockData[0]?.price || 221.30;
  
  // Highlight key events (referendum, strike days, mass assembly, pre-agreement)
  const highlightedDates = ['2026-07-16', '2026-07-24', '2026-08-24', '2026-08-28'];
  
  let milestones = stockData.filter((d, i) => d.is_milestone || highlightedDates.includes(d.date) || i === stockData.length - 1);
  if (milestones.length === 0) milestones = stockData.slice(-5);

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  container.innerHTML = milestones.map((m) => {
    const fullIdx = stockData.findIndex(s => s.date === m.date);
    const prevPrice = fullIdx > 0 ? stockData[fullIdx - 1].price : m.price;
    const dodChange = typeof m.dod_change_pct === 'number' ? m.dod_change_pct : (prevPrice > 0 ? ((m.price - prevPrice) / prevPrice) * 100 : 0);
    const peakChange = typeof m.peak_change_pct === 'number' ? m.peak_change_pct : (peakPrice > 0 ? ((m.price - peakPrice) / peakPrice) * 100 : 0);
    
    const dodFormatted = (dodChange > 0 ? '+' : '') + dodChange.toFixed(2).replace('.', ',') + '%';
    const peakFormatted = (peakChange > 0 ? '+' : '') + peakChange.toFixed(2).replace('.', ',') + '%';
    
    const parts = m.date.split('-');
    const dayNum = parseInt(parts[2], 10);
    const monthNum = parseInt(parts[1], 10);
    const formattedDate = `${dayNum} de ${months[monthNum - 1] || 'Agosto'}`;

    let colorClass = 'text-sky-400';
    if (m.date >= '2026-08-25') colorClass = 'text-rose-400';
    else if (m.date >= '2026-08-24') colorClass = 'text-purple-400';
    else if (m.date >= '2026-07-24') colorClass = 'text-amber-400';

    return `
      <div class="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center hover:border-slate-700 transition">
        <div class="pr-2">
          <span class="${colorClass} font-bold">${formattedDate} (${m.price.toFixed(2).replace('.', ',')} €):</span>
          <p class="text-slate-300 text-[11px] mt-0.5 leading-snug">${m.event}</p>
        </div>
        <div class="text-right shrink-0">
          <span class="${dodChange <= 0 ? 'text-rose-400' : 'text-emerald-400'} font-mono font-bold block text-xs">${dodFormatted}</span>
          <span class="text-slate-500 font-mono text-[9.5px] block">pico: ${peakFormatted}</span>
        </div>
      </div>
    `;
  }).join('');
}

let currentStockRange = 'ALL';

function setStockTimeRange(range) {
  currentStockRange = range;
  document.querySelectorAll('.stock-range-btn').forEach(btn => {
    btn.classList.remove('bg-rose-600', 'text-white', 'border-rose-500');
    btn.classList.add('bg-slate-900', 'text-slate-300', 'border-slate-700');
  });

  const activeBtn = document.getElementById(`btn-stock-${range.toLowerCase()}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-slate-900', 'text-slate-300', 'border-slate-700');
    activeBtn.classList.add('bg-rose-600', 'text-white', 'border-rose-500');
  }

  initAirbusStockChart();
}

function initAirbusStockChart() {
  const rawStockData = conflictData?.stock_market_analysis?.daily_history_conflict || [];
  if (rawStockData.length === 0) return;

  // Render dynamic milestone cards
  renderStockMilestones(rawStockData);

  // Apply time-range slice
  let stockData = rawStockData;
  if (currentStockRange === '1M') {
    stockData = rawStockData.slice(-14);
  } else if (currentStockRange === '3M') {
    stockData = rawStockData.slice(-30);
  }

  const latestEntry = rawStockData[rawStockData.length - 1];
  if (latestEntry) {
    const priceEl = document.getElementById('stock-kpi-price');
    if (priceEl) priceEl.textContent = `${latestEntry.price.toFixed(2).replace('.', ',')} €`;
    const mcapEl = document.getElementById('stock-kpi-mcap');
    if (mcapEl) {
      const mcap = (latestEntry.price * 792.3).toFixed(1);
      mcapEl.textContent = `${parseFloat(mcap).toLocaleString()} M€`;
    }
  }
  const labels = stockData.map(d => {
    const parts = d.date.split('-');
    return `${parts[2]}/${parts[1]}`;
  });
  const prices = stockData.map(d => d.price);
  const events = stockData.map(d => d.event);

  airbusStockChart = renderResilientChart('airbusStockChart', () => ({
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Cotización Airbus SE (AIR.PA - €)',
          data: prices,
          borderColor: '#f43f5e',
          backgroundColor: 'rgba(244, 63, 94, 0.12)',
          fill: true,
          borderWidth: 3,
          tension: 0.25,
          pointRadius: stockData.map((d, i) => (d.is_milestone || i === 0 || i === stockData.length - 1) ? 6 : 3),
          pointBackgroundColor: stockData.map((d, i) => (d.is_milestone || i === 0 || i === stockData.length - 1) ? '#fb7185' : '#f43f5e'),
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointHoverRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        y: {
          min: Math.floor(Math.min(...prices) - 3),
          max: Math.ceil(Math.max(...prices) + 3),
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: {
            color: '#94a3b8',
            callback: v => `${v.toFixed(0)} €`
          },
          title: {
            display: true,
            text: 'Precio de Cierre (€ / acción)',
            color: '#94a3b8',
            font: { size: 10, weight: 'bold' }
          }
        },
        x: {
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: { color: '#e2e8f0', font: { weight: 'bold', size: 10 } }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#cbd5e1', font: { size: 11, weight: 'bold' } }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#fb7185',
          bodyColor: '#f8fafc',
          borderColor: '#475569',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            title: function(context) {
              const idx = context[0].dataIndex;
              return `${stockData[idx].date} — AIR.PA: ${stockData[idx].price.toFixed(2)} €`;
            },
            label: function(context) {
              const idx = context.dataIndex;
              return ` Hito: ${events[idx]}`;
            }
          }
        }
      }
    }
  }));
}


// ==================== COMPANY FINANCIAL HEALTH CHARTS ====================
function initCompanyHealthCharts() {
  initCompanyRevenueChart();
  initCompanyDeliveriesChart();
  initShareholderPieChart();
}

function initCompanyRevenueChart() {
  const history = conflictData?.company_financial_health?.financial_history_2020_2026 || [];
  if (history.length === 0) return;

  const labels = history.map(h => h.year);
  const revenues = history.map(h => h.revenue_eur_m);
  const netIncomes = history.map(h => h.net_income_eur_m);

  companyRevenueChart = renderResilientChart('companyRevenueChart', () => ({
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          type: 'bar',
          label: 'Ingresos Totales (M€)',
          data: revenues,
          backgroundColor: 'rgba(16, 185, 129, 0.75)',
          borderColor: '#10b981',
          borderWidth: 1,
          borderRadius: 6,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'Beneficio Neto (M€)',
          data: netIncomes,
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.15)',
          borderWidth: 3,
          pointRadius: 4,
          pointBackgroundColor: '#38bdf8',
          tension: 0.25,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: { color: '#94a3b8', callback: v => `${(v/1000).toFixed(0)}k M€` },
          title: { display: true, text: 'Ingresos (M€)', color: '#10b981', font: { size: 10, weight: 'bold' } }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: '#38bdf8', callback: v => `${v} M€` },
          title: { display: true, text: 'Beneficio Neto (M€)', color: '#38bdf8', font: { size: 10, weight: 'bold' } }
        },
        x: {
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: { color: '#e2e8f0', font: { weight: 'bold', size: 10 } }
        }
      },
      plugins: {
        legend: { labels: { color: '#cbd5e1', font: { size: 10.5, weight: 'bold' } } }
      }
    }
  }));
}

function initCompanyDeliveriesChart() {
  const history = conflictData?.company_financial_health?.financial_history_2020_2026 || [];
  if (history.length === 0) return;

  const labels = history.map(h => h.year);
  const deliveries = history.map(h => h.deliveries);

  companyDeliveriesChart = renderResilientChart('companyDeliveriesChart', () => ({
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Entregas Comerciales (Aviones/Año)',
          data: deliveries,
          borderColor: '#818cf8',
          backgroundColor: 'rgba(129, 140, 248, 0.15)',
          fill: true,
          borderWidth: 3,
          tension: 0.25,
          pointRadius: 5,
          pointBackgroundColor: '#818cf8',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: {
          min: 450,
          max: 950,
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: { color: '#94a3b8', callback: v => `${v} uds` },
          title: { display: true, text: 'Aviones Entregados', color: '#818cf8', font: { size: 10, weight: 'bold' } }
        },
        x: {
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: { color: '#e2e8f0', font: { weight: 'bold', size: 10 } }
        }
      },
      plugins: {
        legend: { labels: { color: '#cbd5e1', font: { size: 10.5, weight: 'bold' } } }
      }
    }
  }));
}

function initShareholderPieChart() {
  const shareholders = conflictData?.company_financial_health?.shareholder_structure || [];
  if (shareholders.length === 0) return;

  const labels = shareholders.map(s => s.entity);
  const pcts = shareholders.map(s => s.pct);
  const colors = shareholders.map(s => s.color || '#38bdf8');

  shareholderPieChart = renderResilientChart('shareholderPieChart', () => ({
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [
        {
          data: pcts,
          backgroundColor: colors,
          borderColor: '#0f172a',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#38bdf8',
          bodyColor: '#f8fafc',
          callbacks: {
            label: function(context) {
              return ` ${context.label}: ${context.raw}% del capital`;
            }
          }
        }
      },
      cutout: '65%'
    }
  }));
}

function initUnionCharts() {
  initUnionShareChart();
  initUnionEvolutionChart();
  initSiteDelegatesChart();
  initReferendumPieChart();
  initReferendumSitesChart();
  initUnionSitesBreakdown();
}

function initUnionShareChart() {
  const unionData = conflictData?.trade_union_representation?.current_shares || [
    { union_code: "CCOO", name: "CCOO", pct: 38.38, delegates: 76, color: "#dc2626" },
    { union_code: "UGT", name: "UGT", pct: 18.18, delegates: 36, color: "#ea580c" },
    { union_code: "ATP", name: "ATP-SAE", pct: 15.66, delegates: 31, color: "#9333ea" },
    { union_code: "SIPA", name: "SIPA", pct: 15.15, delegates: 30, color: "#0284c7" },
    { union_code: "CGT", name: "CGT", pct: 12.63, delegates: 25, color: "#16a34a" }
  ];

  const labels = unionData.map(u => u.name || u.union_code);
  const pcts = unionData.map(u => u.pct);
  const colors = unionData.map(u => u.color || '#38bdf8');

  unionShareChart = renderResilientChart('unionShareChart', () => ({
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [
        {
          data: pcts,
          backgroundColor: colors,
          borderColor: '#0f172a',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              const idx = context.dataIndex;
              const u = unionData[idx];
              return ` ${u.name}: ${u.pct}% (${u.delegates || Math.round(u.pct * 1.84)} delegados)`;
            }
          }
        }
      },
      cutout: '60%'
    }
  }));
}

function initUnionEvolutionChart() {
  const history = conflictData?.trade_union_representation?.historical_evolution || [
    { period: "2010 - 2015", ccoo_pct: 46.5, ugt_pct: 34.0, sipa_pct: 0.0, cgt_pct: 11.5, atp_pct: 5.0, util_pct: 3.0 },
    { period: "2015 - 2019", ccoo_pct: 42.0, ugt_pct: 30.5, sipa_pct: 9.5, cgt_pct: 9.0, atp_pct: 6.0, util_pct: 3.0 },
    { period: "2019 - 2023", ccoo_pct: 38.2, ugt_pct: 26.0, sipa_pct: 16.0, cgt_pct: 8.8, atp_pct: 7.0, util_pct: 4.0 },
    { period: "2023 - 2026", ccoo_pct: 38.38, ugt_pct: 18.18, atp_pct: 15.66, sipa_pct: 15.15, cgt_pct: 12.63, util_pct: 0.0 }
  ];

  const periods = history.map(h => h.period);

  unionEvolutionChart = renderResilientChart('unionEvolutionChart', () => ({
    type: 'bar',
    data: {
      labels: periods,
      datasets: [
        { label: 'CCOO', data: history.map(h => h.ccoo_pct), backgroundColor: '#dc2626', borderRadius: 4 },
        { label: 'UGT', data: history.map(h => h.ugt_pct), backgroundColor: '#ea580c', borderRadius: 4 },
        { label: 'SIPA', data: history.map(h => h.sipa_pct), backgroundColor: '#0284c7', borderRadius: 4 },
        { label: 'CGT', data: history.map(h => h.cgt_pct), backgroundColor: '#16a34a', borderRadius: 4 },
        { label: 'ATP-SAE', data: history.map(h => h.atp_pct), backgroundColor: '#9333ea', borderRadius: 4 },
        { label: 'ÚTIL', data: history.map(h => h.util_pct), backgroundColor: '#f59e0b', borderRadius: 4 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, grid: { color: 'rgba(51, 65, 85, 0.4)' }, ticks: { color: '#e2e8f0', font: { weight: 'bold', size: 10 } } },
        y: {
          stacked: true,
          max: 100,
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: { color: '#94a3b8', callback: v => `${v}%` },
          title: { display: true, text: '% Representatividad Total', color: '#94a3b8', font: { size: 10, weight: 'bold' } }
        }
      },
      plugins: {
        legend: { labels: { color: '#cbd5e1', font: { size: 10, weight: 'bold' } } }
      }
    }
  }));
}

function initSiteDelegatesChart() {
  const sites = conflictData?.trade_union_representation?.site_breakdown || [
    { site_id: "getafe", name: "Getafe", delegates_by_union: { "SIPA": 15, "CCOO": 13, "ATP": 9, "CGT": 5, "UGT": 3 } },
    { site_id: "san_pablo", name: "San Pablo", delegates_by_union: { "UGT": 10, "CCOO": 9, "SIPA": 6, "ATP": 3, "CGT": 3 } },
    { site_id: "illescas", name: "Illescas", delegates_by_union: { "CCOO": 13, "CGT": 6, "UGT": 4, "ATP": 3, "SIPA": 1 } },
    { site_id: "tablada", name: "Tablada", delegates_by_union: { "CCOO": 11, "UGT": 8, "CGT": 3, "ATP": 3, "SIPA": 0 } },
    { site_id: "cadiz_cbc", name: "Cádiz (CBC)", delegates_by_union: { "CCOO": 10, "CGT": 6, "UGT": 4, "ATP": 3, "SIPA": 2 } },
    { site_id: "barajas", name: "Barajas", delegates_by_union: { "CCOO": 10, "ATP": 7, "SIPA": 5, "UGT": 2, "CGT": 1 } },
    { site_id: "albacete", name: "Albacete", delegates_by_union: { "CCOO": 10, "UGT": 5, "ATP": 3, "SIPA": 1, "CGT": 1 } }
  ];

  const siteShortNames = {
    'getafe': 'Getafe',
    'illescas': 'Illescas',
    'san_pablo': 'San Pablo',
    'tablada': 'Tablada',
    'cadiz_cbc': 'Cádiz',
    'albacete': 'Albacete',
    'barajas': 'Barajas'
  };

  const labels = sites.map(s => siteShortNames[s.site_id] || s.name.split(' ')[0]);

  siteDelegatesChart = renderResilientChart('siteDelegatesChart', () => ({
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'CCOO', data: sites.map(s => s.delegates_by_union?.['CCOO'] || 0), backgroundColor: '#dc2626', borderRadius: 2 },
        { label: 'SIPA', data: sites.map(s => s.delegates_by_union?.['SIPA'] || 0), backgroundColor: '#0284c7', borderRadius: 2 },
        { label: 'UGT', data: sites.map(s => s.delegates_by_union?.['UGT'] || 0), backgroundColor: '#ea580c', borderRadius: 2 },
        { label: 'ATP', data: sites.map(s => s.delegates_by_union?.['ATP'] || 0), backgroundColor: '#9333ea', borderRadius: 2 },
        { label: 'CGT', data: sites.map(s => s.delegates_by_union?.['CGT'] || 0), backgroundColor: '#16a34a', borderRadius: 2 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, grid: { color: 'rgba(51, 65, 85, 0.4)' }, ticks: { color: '#e2e8f0', font: { weight: 'bold', size: 9.5 } } },
        y: {
          stacked: true,
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: { color: '#94a3b8', stepSize: 5 },
          title: { display: true, text: 'Nº Delegados', color: '#94a3b8', font: { size: 9.5, weight: 'bold' } }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 8
        }
      }
    }
  }));
}

function initReferendumPieChart() {
  referendumPieChart = renderResilientChart('referendumPieChart', () => ({
    type: 'doughnut',
    data: {
      labels: ['Voto NO (Rechazo)', 'Voto SÍ (Aprobación)', 'Votos Blanco / Nulos'],
      datasets: [
        {
          data: [49.15, 46.24, 4.62],
          backgroundColor: ['#f43f5e', '#10b981', '#64748b'],
          borderColor: '#0f172a',
          borderWidth: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const val = context.raw || 0;
              const votes = context.dataIndex === 0 ? '6.229 votos' : (context.dataIndex === 1 ? '5.860 votos' : '585 votos');
              return ` ${label}: ${val}% (${votes})`;
            }
          }
        }
      },
      cutout: '55%'
    }
  }));
}

function initReferendumSitesChart() {
  const sites = conflictData?.trade_union_representation?.site_breakdown || [];
  const sortedSites = [...sites].sort((a, b) => (b.referendum_24j?.no_pct || 0) - (a.referendum_24j?.no_pct || 0));

  const siteShortNames = {
    'cadiz_cbc': 'Cádiz (CBC)',
    'illescas': 'Illescas',
    'getafe': 'Getafe',
    'barajas': 'Barajas',
    'san_pablo': 'San Pablo',
    'tablada': 'Tablada',
    'albacete': 'Albacete'
  };

  const labels = sortedSites.map(s => siteShortNames[s.site_id] || s.name.split(' ')[0]);
  const noData = sortedSites.map(s => s.referendum_24j?.no_pct || 0);
  const yesData = sortedSites.map(s => s.referendum_24j?.yes_pct || 0);
  const turnoutData = sortedSites.map(s => s.referendum_24j?.turnout_pct || 0);

  referendumSitesChart = renderResilientChart('referendumSitesChart', () => ({
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: '% Voto NO (Rechazo)',
          data: noData,
          backgroundColor: '#f43f5e',
          borderRadius: 4
        },
        {
          label: '% Voto SÍ (Aprobación)',
          data: yesData,
          backgroundColor: '#10b981',
          borderRadius: 4
        },
        {
          label: '% Participación',
          data: turnoutData,
          backgroundColor: '#38bdf8',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: { color: '#e2e8f0', font: { weight: 'bold', size: 9.5 } }
        },
        y: {
          max: 100,
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: { color: '#94a3b8', callback: v => `${v}%` },
          title: { display: true, text: '% Resultados por Factoría', color: '#94a3b8', font: { size: 9.5, weight: 'bold' } }
        }
      },
      plugins: {
        legend: { labels: { color: '#cbd5e1', font: { size: 10, weight: 'bold' } } },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 8
        }
      }
    }
  }));
}

let currentSelectedSite = 'all';

function initUnionSitesBreakdown() {
  const btnContainer = document.getElementById('site-selector-buttons');
  const detailsContainer = document.getElementById('site-breakdown-details-container');
  if (!btnContainer || !detailsContainer) return;

  const sites = conflictData?.trade_union_representation?.site_breakdown || [];
  if (sites.length === 0) return;

  const siteShortNames = {
    'getafe': 'Getafe',
    'illescas': 'Illescas',
    'san_pablo': 'San Pablo',
    'tablada': 'Tablada',
    'cadiz_cbc': 'Cádiz (CBC)',
    'albacete': 'Albacete',
    'barajas': 'Barajas'
  };

  // Render Buttons
  btnContainer.innerHTML = `
    <button type="button" onclick="selectUnionSite('all')" id="btn-site-all" class="px-2.5 py-1 text-xs font-bold rounded-lg border transition ${currentSelectedSite === 'all' ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'}">
      Todos los Centros (${sites.length})
    </button>
  ` + sites.map(s => `
    <button type="button" onclick="selectUnionSite('${escapeHTML(s.site_id)}')" id="btn-site-${escapeHTML(s.site_id)}" class="px-2.5 py-1 text-xs font-bold rounded-lg border transition ${currentSelectedSite === s.site_id ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'}">
      ${escapeHTML(siteShortNames[s.site_id] || s.name.split(' ')[0])}
    </button>
  `).join('');
  renderUnionSiteCards(sites);
}

window.selectUnionSite = function(siteId) {
  currentSelectedSite = siteId;
  const sites = conflictData?.trade_union_representation?.site_breakdown || [];

  // Update button styles
  const allBtns = document.querySelectorAll('#site-selector-buttons button');
  allBtns.forEach(btn => {
    btn.className = 'px-2.5 py-1 text-xs font-bold rounded-lg border transition bg-slate-900 text-slate-400 border-slate-800 hover:text-white';
  });
  const activeBtn = document.getElementById(`btn-site-${siteId}`);
  if (activeBtn) {
    activeBtn.className = 'px-2.5 py-1 text-xs font-bold rounded-lg border transition bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30';
  }

  renderUnionSiteCards(sites);
};

function renderUnionSiteCards(sites) {
  const detailsContainer = document.getElementById('site-breakdown-details-container');
  if (!detailsContainer) return;

  const filteredSites = currentSelectedSite === 'all' 
    ? sites 
     : sites.filter(s => s.site_id === currentSelectedSite);

  detailsContainer.innerHTML = filteredSites.map(site => {
    const totalDels = site.total_delegates || 1;
    const dels = site.delegates_by_union || {};
    const ref = site.referendum_24j || {};

    const unionColors = {
      "SIPA": { bg: "bg-sky-500", text: "text-sky-400", border: "border-sky-500/30" },
      "CCOO": { bg: "bg-red-500", text: "text-red-400", border: "border-red-500/30" },
      "UGT": { bg: "bg-orange-500", text: "text-orange-400", border: "border-orange-500/30" },
      "ATP": { bg: "bg-purple-500", text: "text-purple-400", border: "border-purple-500/30" },
      "CGT": { bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/30" },
      "UTIL": { bg: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/30" }
    };

    return `
      <div class="p-4 sm:p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4 hover:border-slate-700 transition">
        <!-- Site Header -->
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

        <!-- 2 Columns: Delegates breakdown & Referendum 24-J outcome -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Left: Delegates by Union -->
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

          <!-- Right: 24-J Referendum & Assembly Dynamic -->
          <div class="space-y-3">
            <div class="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2">
              <div class="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>Resultado Referéndum 24-Julio (Preacuerdo)</span>
                <span class="text-[10px] text-sky-400 font-mono">Participación: ${ref.turnout_pct}%</span>
              </div>
              <div class="grid grid-cols-3 gap-2 text-center pt-1">
                <div class="p-2 bg-rose-950/30 border border-rose-500/30 rounded-lg">
                  <span class="text-[9px] text-rose-400 uppercase font-black block">Voto NO</span>
                  <span class="text-sm font-black text-rose-300 font-mono">${ref.no_pct}%</span>
                  <span class="text-[9px] text-slate-400 block">(${ref.no_votes?.toLocaleString() || '-'} votos)</span>
                </div>
                <div class="p-2 bg-emerald-950/30 border border-emerald-500/30 rounded-lg">
                  <span class="text-[9px] text-emerald-400 uppercase font-black block">Voto SÍ</span>
                  <span class="text-sm font-black text-emerald-300 font-mono">${ref.yes_pct}%</span>
                  <span class="text-[9px] text-slate-400 block">(${ref.yes_votes?.toLocaleString() || '-'} votos)</span>
                </div>
                <div class="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                  <span class="text-[9px] text-slate-400 uppercase font-black block">Blanco / Nulo</span>
                  <span class="text-sm font-black text-slate-300 font-mono">${ref.blank_null_pct}%</span>
                  <span class="text-[9px] text-slate-400 block">(${ref.blank_null_votes?.toLocaleString() || '-'} votos)</span>
                </div>
              </div>
            </div>

            <div class="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs text-slate-300 space-y-1">
              <strong class="text-amber-400 block flex items-center">
                <i data-lucide="activity" class="w-3.5 h-3.5 mr-1 text-amber-400"></i>
                Dinámica Asamblearia y Clave Operativa:
              </strong>
              <p class="text-[11px] text-slate-300 leading-relaxed">${escapeHTML(site.assembly_dynamic)}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}



// ==================== BENCHMARKS ====================
function initBenchmarks() {
  const container = document.getElementById('benchmarks-container');
  if (!container) return;

  const data = conflictData?.benchmarks || [];
  if (data.length === 0) return;

  container.innerHTML = data.map(b => `
    <div class="p-5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl transition flex flex-col justify-between space-y-4 shadow-lg hover:shadow-xl">
      <div class="space-y-3">
        <div class="flex justify-between items-start gap-2 border-b border-slate-800/80 pb-2.5">
          <div>
            <h4 class="text-sm font-bold text-white">${b.case}</h4>
            <p class="text-[11px] text-slate-400 mt-0.5">${b.sector || 'Sector Industrial'} • <span class="text-amber-400 font-bold">${b.duration || (b.strike_duration_days ? b.strike_duration_days + ' días' : '')}</span></p>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-${b.badgeColor || 'emerald'}-500/20 text-${b.badgeColor || 'emerald'}-300 border border-${b.badgeColor || 'emerald'}-500/40 shrink-0">
            ${b.badge || 'Caso Histórico'}
          </span>
        </div>

        <div class="grid grid-cols-1 gap-2 text-xs">
          ${b.initial_offer ? `
            <div class="p-2 bg-rose-950/20 border border-rose-500/20 rounded-lg">
              <span class="text-[10px] font-extrabold uppercase text-rose-400 block mb-0.5">Oferta Inicial Patronal:</span>
              <p class="text-slate-300 text-[11px] leading-relaxed">${b.initial_offer}</p>
            </div>
          ` : ''}
          ${b.final_agreement ? `
            <div class="p-2 bg-emerald-950/20 border border-emerald-500/20 rounded-lg">
              <span class="text-[10px] font-extrabold uppercase text-emerald-400 block mb-0.5">Acuerdo Final Conquistado:</span>
              <p class="text-slate-200 text-[11px] font-bold leading-relaxed">${b.final_agreement}</p>
            </div>
          ` : ''}
        </div>

        ${b.result ? `
          <p class="text-xs text-slate-300 leading-relaxed">${b.result}</p>
        ` : ''}
      </div>

      <div class="pt-3 border-t border-slate-800 space-y-2 text-[11px]">
        <div class="p-2 bg-sky-950/30 border border-sky-500/20 rounded-lg text-sky-300">
          <strong class="text-sky-400 font-bold">Palanca Clave:</strong> ${b.leverage_mechanism || b.lesson || 'Presión industrial asimétrica'}
        </div>
        <div class="text-slate-400">
          <strong class="text-amber-400 font-bold">Lección para Airbus:</strong> ${b.lesson || b.key_lesson || ''}
        </div>
        <div class="text-right pt-1">
          <a href="${b.source_url || 'https://www.iam751.org/'}" target="_blank" rel="noopener noreferrer" class="text-sky-400 underline font-mono text-[9.5px]">[Fuente: ${b.source_name || 'Registro Sindical / Prensa Sectorial'}]</a>
        </div>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

// ==================== WORKFLOWS ====================
function initWorkflows() {
  const container = document.getElementById('workflows-container');
  if (!container) return;

  const workflows = conflictData?.workflows || [];
  if (workflows.length === 0) return;

  container.innerHTML = workflows.map(wf => `
    <div class="p-5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl transition space-y-4 shadow-xl">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800/80 pb-3">
        <div class="flex items-center space-x-2.5">
          <span class="px-2.5 py-1 rounded-lg text-xs font-black bg-${wf.color || 'indigo'}-500/20 text-${wf.color || 'indigo'}-300 border border-${wf.color || 'indigo'}-500/40">${wf.badge}</span>
          <h3 class="text-sm sm:text-base font-bold text-white">${wf.title}</h3>
        </div>
        <span class="text-[11px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">${wf.category || 'Protocolo'}</span>
      </div>

      <p class="text-xs text-slate-300 leading-relaxed">${wf.description || wf.objective || ''}</p>

      <div class="space-y-3 pt-1">
        ${(wf.steps || []).map(step => `
          <div class="p-3.5 bg-slate-950/80 border border-slate-800/90 rounded-xl space-y-2 hover:border-slate-700/80 transition">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-bold text-white flex items-center">
                <span class="w-5 h-5 rounded-full bg-slate-800 text-sky-400 font-mono text-[11px] font-black inline-flex items-center justify-center mr-2 shrink-0">${step.step_num || step.step}</span>
                ${step.title}
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-sky-500/15 text-sky-300 border border-sky-500/30 shrink-0">
                ${step.gate_badge || step.gate || 'Mandatorio'}
              </span>
            </div>

            <p class="text-xs text-slate-300 leading-relaxed">${step.action || step.condition}</p>

            ${step.legal_basis ? `
              <div class="text-[11px] text-sky-400 font-medium flex items-center pt-0.5">
                <i data-lucide="scale" class="w-3.5 h-3.5 mr-1 text-sky-400 shrink-0"></i>
                <span>${step.legal_basis}</span>
              </div>
            ` : ''}

            ${step.warning_danger || step.danger ? `
              <div class="p-2 bg-rose-950/30 border border-rose-500/25 rounded-lg text-[11px] text-rose-300 leading-relaxed flex items-start space-x-1.5">
                <span class="font-bold text-rose-400 shrink-0">⚠️ Riesgo / Trampa:</span>
                <span>${step.warning_danger || step.danger}</span>
              </div>
            ` : ''}

            ${step.safeguard ? `
              <div class="p-2 bg-emerald-950/30 border border-emerald-500/25 rounded-lg text-[11px] text-emerald-300 leading-relaxed flex items-start space-x-1.5">
                <span class="font-bold text-emerald-400 shrink-0">🛡️ Salvaguarda:</span>
                <span>${step.safeguard}</span>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

// ==================== HISTORICAL AGREEMENTS & LOSSES ====================
function initHistoricalLosses() {
  const hist = conflictData?.historical_agreements_and_losses;
  if (!hist) return;

  // 1. Render Yearly Losses Table
  const tableBody = document.getElementById('yearly-losses-table-body');
  if (tableBody && hist.yearly_loss_metrics_table) {
    tableBody.innerHTML = hist.yearly_loss_metrics_table.map(row => `
      <tr class="hover:bg-slate-900/50 transition">
        <td class="p-3.5 font-bold text-white whitespace-nowrap">${row.year}</td>
        <td class="p-3.5 text-sky-400 font-mono font-bold">${row.cost_of_living_index.toFixed(1)}</td>
        <td class="p-3.5 text-amber-400 font-mono font-bold">${row.airbus_rsg_index.toFixed(1)}</td>
        <td class="p-3.5 text-rose-400 font-mono">${row.nominal_gross_loss_eur !== 0 ? `${row.nominal_gross_loss_eur.toLocaleString()} €` : '0 €'}</td>
        <td class="p-3.5 text-emerald-400 font-mono font-bold">${row.one_off_payment_received_eur > 0 ? `+${row.one_off_payment_received_eur.toLocaleString()} €` : '-'}</td>
        <td class="p-3.5 text-rose-300 font-mono font-black bg-rose-950/20">${row.updated_net_loss_eur !== 0 ? `${row.updated_net_loss_eur.toLocaleString()} €` : '0 €'}</td>
        <td class="p-3.5 text-slate-300 text-[11px]">${row.notes}</td>
      </tr>
    `).join('');
  }

  // 2. Render BOE Collective Agreements History
  const boeGrid = document.getElementById('boe-agreements-grid');
  if (boeGrid && hist.boe_agreements_history) {
    boeGrid.innerHTML = hist.boe_agreements_history.map(c => `
      <div class="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition">
        <div class="flex justify-between items-start">
          <span class="text-xs font-black text-white">${c.name}</span>
          <span class="px-2 py-0.5 text-[9px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">Oficial BOE</span>
        </div>
        <a href="${c.url || 'https://www.boe.es/diario_boe/txt.php?id=' + (c.boe_id || 'BOE-A-2021-19616')}" target="_blank" rel="noopener noreferrer" class="text-[11px] text-sky-400 underline font-mono block">${c.boe_reference} [Ver en BOE]</a>
        <p class="text-xs text-slate-300 leading-relaxed mt-2"><strong class="text-slate-200">Firmantes:</strong> ${c.parties_signatory}</p>
        <p class="text-xs text-slate-400 leading-relaxed"><strong class="text-slate-300">Cláusulas Clave:</strong> ${c.key_clauses}</p>
        <div class="p-2 bg-rose-950/30 border border-rose-500/20 rounded-lg text-[11px] text-rose-300 mt-2">
          <strong>Consecuencia Real:</strong> ${c.consequences}
        </div>
      </div>
    `).join('');
  }

  // 3. Render Failed Pacts & Betrayals
  const failedPactsContainer = document.getElementById('failed-pacts-container');
  if (failedPactsContainer && hist.failed_pacts_and_betrayals) {
    failedPactsContainer.innerHTML = hist.failed_pacts_and_betrayals.map(p => `
      <div class="p-4 bg-slate-900/90 border border-amber-500/30 rounded-xl space-y-2 hover:border-amber-500/50 transition">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
          <h4 class="text-xs sm:text-sm font-black text-amber-300 flex items-center">
            <i data-lucide="alert-triangle" class="w-4 h-4 mr-1.5 text-amber-400"></i>
            ${p.event}
          </h4>
          <span class="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">${p.actors} <a href="https://t.me/+MnuqJDCAAgYyMGQ0" target="_blank" rel="noopener noreferrer" class="text-sky-400 underline ml-1">[Acta / Asambleas]</a></span>
        <p class="text-xs text-slate-300 leading-relaxed">${p.description}</p>
        ${p.content_signed ? `<div class="text-xs text-slate-400"><strong class="text-slate-300">Contenido del Preacuerdo:</strong> ${p.content_signed}</div>` : ''}
        ${p.assembly_reaction ? `<div class="text-xs text-rose-400"><strong class="text-rose-300">Respuesta de las Asambleas:</strong> ${p.assembly_reaction}</div>` : ''}
        ${p.referendum_outcome ? `
          <div class="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 font-bold flex items-center space-x-2 mt-2">
            <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 shrink-0"></i>
            <span>${p.referendum_outcome}</span>
          </div>
        ` : ''}
        ${p.judicial_and_strike_outcome ? `
          <div class="p-2.5 bg-sky-950/40 border border-sky-500/30 rounded-lg text-xs text-sky-300 font-medium mt-2">
            <strong>Desenlace:</strong> ${p.judicial_and_strike_outcome}
          </div>
        ` : ''}
      </div>
    `).join('');
  }
}

// ==================== NEGOTIATION EVOLUTION & GAP ANALYSIS ====================
function renderSensitiveBadge(tooltip = "Información provisional en revisión / negociación activa") {
  return `<span class="badge-sensitive" title="${escapeHTML(tooltip)}"><i data-lucide="alert-triangle" class="w-3 h-3 text-amber-400"></i> [WARN] Información Sensible en Revisión</span>`;
}

function renderSalaryProposalsMatrix() {
  const matrixData = conflictData?.salary_proposals_comparison?.comparison_matrix;
  const container = document.getElementById('salary-proposals-matrix-body');
  if (!container || !matrixData) return;

  container.innerHTML = matrixData.map(item => {
    let badgeClass = "bg-rose-500/20 text-rose-300 border-rose-500/30";
    if (item.badge_type && (item.badge_type.includes("Garantía") || item.badge_type.includes("Blindaje"))) {
      badgeClass = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    } else if (item.badge_type && (item.badge_type.includes("Línea Roja") || item.badge_type.includes("Salarial"))) {
      badgeClass = "bg-amber-500/20 text-amber-300 border-amber-500/30";
    } else if (item.badge_type && (item.badge_type.includes("Soberanía") || item.badge_type.includes("Vida"))) {
      badgeClass = "bg-sky-500/20 text-sky-300 border-sky-500/30";
    }

    return `
      <tr class="hover:bg-slate-900/60 transition border-b border-slate-800/60 text-xs">
        <td class="p-3.5 font-bold text-white align-top">
          <div class="flex flex-col gap-1">
            <span class="text-slate-100 font-semibold">${item.topic}</span>
            <span class="w-fit text-[9px] px-1.5 py-0.5 rounded font-black border ${badgeClass}">${item.badge_type || item.category}</span>
          </div>
        </td>
        <td class="p-3.5 text-rose-300/90 align-top bg-rose-950/10 font-normal leading-relaxed">
          ${item.company_offer}
        </td>
        <td class="p-3.5 text-emerald-300 align-top bg-emerald-950/10 font-medium leading-relaxed">
          ${item.cgt_offer}
        </td>
        <td class="p-3.5 text-amber-300 align-top bg-amber-950/10 font-medium leading-relaxed">
          ${item.strike_committee_offer}
        </td>
        <td class="p-3.5 text-sky-300 text-[11px] align-top bg-slate-950/40">
          <p class="font-medium">${item.key_difference}</p>
          <span class="block mt-1 text-[9.5px] text-slate-500 font-mono">[${item.source_citation}]</span>
        </td>
      </tr>
    `;
  }).join('');
}

function initNegotiationEvolution() {
  const evo = conflictData?.negotiation_evolution;
  if (!evo) return;

  // 1. Render Initial Demands
  const initialGrid = document.getElementById('initial-demands-grid');
  if (initialGrid && evo.initial_demands_july) {
    initialGrid.innerHTML = evo.initial_demands_july.items.map(item => `
      <div class="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700 transition">
        <div>
          <span class="text-xs font-bold text-sky-400 block">${item.topic}</span>
          <p class="text-xs text-slate-300 mt-1 leading-relaxed">${item.demand}</p>
        </div>
        <div class="mt-2 pt-2 border-t border-slate-800/80 flex justify-between items-center text-[10px] text-slate-500">
          <span>Reivindicación Base</span>
          <i data-lucide="shield-check" class="w-3.5 h-3.5 text-sky-400"></i>
        </div>
      </div>
    `).join('');
  }

  // 2. Render Proposal Evolution Stages
  const stagesContainer = document.getElementById('negotiation-stages-container');
  if (stagesContainer && evo.proposal_evolution_stages) {
    stagesContainer.innerHTML = evo.proposal_evolution_stages.map(st => `
      <div class="p-4 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-slate-700 transition space-y-2.5">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-1 border-b border-slate-800/80 pb-2">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-black text-white font-mono bg-slate-800 px-2 py-0.5 rounded">${st.stage}</span>
            <span class="text-xs font-bold text-slate-200">${st.event}</span>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
          <div class="p-2.5 bg-rose-950/20 border border-rose-500/20 rounded-lg">
            <span class="text-[10px] font-extrabold uppercase text-rose-400 block mb-1">Oferta / Postura Dirección Airbus:</span>
            <p class="text-slate-300 leading-relaxed">${st.company_offer}</p>
          </div>
          <div class="p-2.5 bg-emerald-950/20 border border-emerald-500/20 rounded-lg">
            <span class="text-[10px] font-extrabold uppercase text-emerald-400 block mb-1">Respuesta Sindical / Asambleas:</span>
            <p class="text-slate-300 leading-relaxed">${st.union_response}</p>
          </div>
        </div>
      </div>
    `).join('');
  }

  // 3. Render Gap Analysis Table
  const gapTableBody = document.getElementById('gap-analysis-table-body');
  if (gapTableBody && evo.current_gap_analysis) {
    gapTableBody.innerHTML = evo.current_gap_analysis.map(gap => {
      let badgeClass = "bg-rose-500/20 text-rose-300 border-rose-500/30";
      if (gap.status.includes("Condicionado") || gap.status.includes("Acercamiento")) {
        badgeClass = "bg-amber-500/20 text-amber-300 border-amber-500/30";
      } else if (gap.status.includes("Técnico")) {
        badgeClass = "bg-sky-500/20 text-sky-300 border-sky-500/30";
      }

      return `
        <tr class="hover:bg-slate-900/50 transition">
          <td class="p-3.5 font-bold text-white align-top whitespace-nowrap">${gap.topic}</td>
          <td class="p-3.5 text-slate-200 align-top bg-emerald-950/10 font-medium">${gap.union_position}</td>
          <td class="p-3.5 text-slate-300 align-top bg-rose-950/10">${gap.company_position}</td>
          <td class="p-3.5 text-amber-300 font-bold align-top bg-amber-950/10">${gap.gap}</td>
          <td class="p-3.5 text-center align-top whitespace-nowrap">
            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold border ${badgeClass}">
              ${gap.status}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 4. Render 11-Point Strike Committee Platform
  const committeeGrid = document.getElementById('committee-11points-grid');
  const platformPoints = conflictData?.negotiation?.committee_11_points_summary?.points || [
    { num: 1, title: "Desistimiento Recurso TS sobre IT", description: "Compromiso de no retirada del complemento IT y devolución de cantidades descontadas en octubre 2026." },
    { num: 2, title: "Recuperación Poder Adquisitivo", description: "Paga 7500€ no consolidable, subida del 12% a tablas desde 1-ene-2026 e IPC+1.5% anual en 2026/2027." },
    { num: 3, title: "Teletrabajo Universal", description: "Mínimo 40% de jornada trimestral vinculante con reversibilidad exclusiva por el trabajador." },
    { num: 4, title: "Vacaciones Flexibles", description: "Mantenimiento de 2 semanas de cierre completo y 2 semanas en días sueltos flexibles." },
    { num: 5, title: "Comedor Universal Gratuito", description: "Acceso gratuito sin copagos para todos los turnos y centros de Airbus España." },
    { num: 6, title: "Transporte Colectivo", description: "Mantenimiento íntegro de rutas, frecuencias y presupuesto adicional para nuevas paradas." },
    { num: 7, title: "Flexibilidad Horaria Taller", description: "Extensión de 1 hora de flexibilidad de entrada y salida a personal de taller." },
    { num: 8, title: "Garantías Proyecto Bromo", description: "Subrogación bajo art. 44.1 ET, movilidad prioritaria en Airbus y renuncia a despidos." },
    { num: 9, title: "Carga de Trabajo Airbus Cádiz", description: "Plan 2026 vinculante de dotación de carga de trabajo y garantía de plantilla mínima." },
    { num: 10, title: "Catálogo de Puestos (LMA, 5R)", description: "Inclusión formal en catálogo tipo de LMA, rodadores y puestos GP3-5R con complementos." },
    { num: 11, title: "Compensación Huelga", description: "Compensación económica extraordinaria del 100% de los días de huelga de 2026." }
  ];

  if (committeeGrid && platformPoints) {
    committeeGrid.innerHTML = platformPoints.map(p => `
      <div class="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-emerald-500/30 transition">
        <div>
          <div class="flex items-center space-x-2">
            <span class="text-xs font-black text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Punto ${p.num}</span>
            <span class="text-xs font-bold text-slate-200">${escapeHTML(p.title)}</span>
          </div>
          <p class="text-xs text-slate-300 mt-2 leading-relaxed">${escapeHTML(p.description)}</p>
        </div>
        <div class="mt-2.5 pt-2 border-t border-slate-800/80 flex justify-between items-center text-[10px] text-slate-500">
          <span class="text-amber-400/90 font-medium">SIMA 27/08/2026</span>
          <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-400"></i>
        </div>
      </div>
    `).join('');
  }
  // 4. Render Point-by-Point Offer Breakdown with Expandable Explanations
  initDetailedOffers();

  // 5. Render 10-Dimension Comparative Matrix
  renderSalaryProposalsMatrix();
}

function initDetailedOffers() {
  const container = document.getElementById('detailed-offers-accordion-container');
  if (!container) return;

  const offers = conflictData?.negotiation_evolution?.company_offer_detailed_breakdown || [];
  if (!offers || offers.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-400">No hay desglose detallado disponible.</p>`;
    return;
  }

  container.innerHTML = offers.map((off, idx) => {
    const math = off.math_calculation || {};
    const pointNumber = off.point_num || off.point_number || (idx + 1);
    const badgeColor = off.badge_color || 'sky';
    const drawbackNote = off.drawback_reason || (off.technical_analysis ? off.technical_analysis.split('.')[0] + '.' : 'Rechazo asambleario por pérdida de derechos y poder adquisitivo.');

    // Format math items dynamically
    const mathEntries = Object.entries(math);
    const mathHtml = mathEntries.map(([key, val]) => {
      const humanLabel = key
        .replace(/_/g, ' ')
        .replace(/eur$/, '(€)')
        .replace(/pct$/, '(%)')
        .replace(/\b\w/g, l => l.toUpperCase());
      return `
        <div class="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-center">
          <span class="text-[9px] text-slate-400 block uppercase font-bold tracking-tight">${escapeHTML(humanLabel)}</span>
          <span class="text-xs font-black text-white font-mono mt-0.5 block">${escapeHTML(String(val))}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="p-4 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-slate-700 transition space-y-3" id="card-${escapeHTML(off.id)}">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800/80 pb-2.5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2 py-0.5 text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded uppercase">
              Punto ${pointNumber}
            </span>
            <span class="px-2 py-0.5 text-[10px] font-bold bg-${badgeColor}-500/20 text-${badgeColor}-300 border border-${badgeColor}-500/30 rounded">
              ${escapeHTML(off.badge || off.category || 'Negociación')}
            </span>
            <h4 class="text-xs sm:text-sm font-bold text-white">${escapeHTML(off.topic)}</h4>
          </div>
          <button type="button" onclick="toggleOfferDetails('${escapeHTML(off.id)}')" id="btn-toggle-${escapeHTML(off.id)}" class="px-3 py-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-lg flex items-center space-x-1.5 transition self-start sm:self-auto">
            <span>Ver Desglose Técnico & Cálculo</span>
            <i data-lucide="chevron-down" class="w-3.5 h-3.5 transition-transform duration-200" id="icon-${escapeHTML(off.id)}"></i>
          </button>
        </div>

        <!-- Two Column Quick Comparison -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div class="p-3 bg-rose-950/20 border border-rose-500/30 rounded-lg space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black uppercase text-rose-400">Propuesta Dirección Airbus:</span>
              <span class="text-[9px] text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded font-bold">Oferta Patronal</span>
            </div>
            <p class="text-slate-200 text-xs leading-relaxed font-medium">${escapeHTML(off.company_proposal)}</p>
          </div>
          <div class="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black uppercase text-emerald-400">Reivindicación Plataforma Sindical:</span>
              <span class="text-[9px] text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded font-bold">Línea Roja</span>
            </div>
            <p class="text-slate-200 text-xs leading-relaxed font-medium">${escapeHTML(off.union_demand)}</p>
          </div>
        </div>

        <!-- Summary Caveat / Why it's rejected -->
        <div class="p-2.5 bg-amber-950/20 border border-amber-500/30 rounded-lg text-xs text-amber-200 flex items-start space-x-2">
          <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-400 shrink-0 mt-0.5"></i>
          <p class="leading-relaxed"><strong>Trampa detectada / Motivo de rechazo:</strong> ${escapeHTML(drawbackNote)}</p>
        </div>

        <!-- Expandable Detail Drawer (Hidden by default) -->
        <div id="drawer-${escapeHTML(off.id)}" class="hidden pt-3 border-t border-slate-800/80 space-y-4">
          <!-- Actuarial / Math Table -->
          <div class="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <h5 class="text-xs font-bold text-sky-400 flex items-center">
              <i data-lucide="calculator" class="w-4 h-4 mr-1.5 text-sky-400"></i>
              Cálculo de Impacto Financiero y Operativo
            </h5>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-center pt-1">
              ${mathHtml}
            </div>
          </div>

          <!-- Technical & Legal Breakdown -->
          <div class="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5">
            <h5 class="text-xs font-bold text-slate-200 flex items-center">
              <i data-lucide="file-check-2" class="w-4 h-4 mr-1.5 text-indigo-400"></i>
              Fundamentos Jurídicos y Convenio Colectivo
            </h5>
            <p class="text-xs text-slate-300 leading-relaxed">${escapeHTML(off.technical_analysis)}</p>
          </div>

          <!-- Verdict Banner -->
          <div class="p-3 bg-rose-950/30 border border-rose-500/40 rounded-xl flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <i data-lucide="gavel" class="w-4 h-4 text-rose-400"></i>
              <span class="text-xs font-bold text-rose-300">Dictamen Asambleario:</span>
            </div>
            <span class="px-2.5 py-1 text-xs font-black bg-rose-600 text-white rounded-lg uppercase tracking-wider">
              ${escapeHTML(off.verdict)}
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

window.toggleOfferDetails = function(offerId) {
  const drawer = document.getElementById(`drawer-${offerId}`);
  const icon = document.getElementById(`icon-${offerId}`);
  const btn = document.getElementById(`btn-toggle-${offerId}`);
  if (!drawer) return;

  const isHidden = drawer.classList.contains('hidden');
  if (isHidden) {
    drawer.classList.remove('hidden');
    if (icon) icon.classList.add('rotate-180');
    if (btn) btn.querySelector('span').textContent = 'Ocultar Desglose';
  } else {
    drawer.classList.add('hidden');
    if (icon) icon.classList.remove('rotate-180');
    if (btn) btn.querySelector('span').textContent = 'Ver Desglose Técnico & Cálculo';
  }
  if (window.lucide) lucide.createIcons();
};
// ==================== TIMELINE & ASSEMBLY RECORDS ====================
function initTimeline() {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  const timeline = conflictData?.timeline || [];
  if (timeline.length === 0) return;

  container.innerHTML = timeline.map(item => `
    <div class="relative group">
      <!-- Dot on timeline -->
      <div class="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-${item.badge_color || 'blue'}-500 shadow-lg shadow-${item.badge_color || 'blue'}-500/30"></div>

      <div class="bg-slate-900/80 border border-slate-800 group-hover:border-slate-700 p-4 sm:p-5 rounded-2xl transition space-y-3.5">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-black text-white font-mono bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">${item.date}</span>
            <span class="text-xs text-slate-400 font-medium">• ${item.phase}</span>
            ${item.time ? `<span class="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded">🕒 ${item.time}</span>` : ''}
          </div>
          <span class="px-2 py-0.5 text-[10px] font-extrabold rounded bg-${item.badge_color || 'blue'}-500/20 text-${item.badge_color || 'blue'}-400 border border-${item.badge_color || 'blue'}-500/30 self-start sm:self-auto">
            ${item.badge}
          </span>
        </div>

        <div>
          <h3 class="text-sm sm:text-base font-bold text-white">${item.title}</h3>
          ${item.location ? `
            <div class="flex items-center text-xs text-sky-400 mt-1 space-x-1.5">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 text-sky-400 shrink-0"></i>
              <span class="font-medium">${item.location}</span>
            </div>
          ` : ''}
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">${item.summary}</p>

        ${item.census_and_votes ? `
          <div class="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start space-x-2 text-xs">
            <i data-lucide="vote" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
            <div>
              <span class="font-bold text-emerald-400 text-[11px] uppercase tracking-wider block">Censo, Votación & Quórum:</span>
              <span class="text-slate-300 font-mono text-[11px]">${item.census_and_votes}</span>
            </div>
          </div>
        ` : ''}

        <div class="flex flex-wrap gap-1.5 pt-1">
          ${(item.actors || []).map(a => `<span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">${a}</span>`).join('')}
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Doc: ${item.source_ref}</span>
        </div>

        <div class="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-[11px] text-slate-300">
          <strong class="text-amber-400">Lección Estratégica:</strong> ${item.strategic_takeaway}
        </div>
      </div>
    </div>
  `).join('');
}

// ==================== THERMOMETER & BELUGA LOGISTICS ====================
let selectedBelugaTail = 'ALL';

function setBelugaTailFilter(tail) {
  selectedBelugaTail = tail;
  document.querySelectorAll('.beluga-tail-btn').forEach(btn => {
    const btnTail = btn.getAttribute('data-tail');
    if (btnTail === tail) {
      btn.className = "beluga-tail-btn px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white transition";
    } else {
      btn.className = "beluga-tail-btn px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition";
    }
  });

  initBelugaLogistics();
}

function renderBelugaFleet(beluga) {
  const fleetGrid = document.getElementById('beluga-fleet-grid');
  if (!fleetGrid || !beluga.all_aircraft) return;

  const filteredAircraft = beluga.all_aircraft.filter(ac => {
    if (selectedBelugaTail === 'ALL') return true;
    return (ac.registration === selectedBelugaTail) || (ac.name && ac.name.includes(selectedBelugaTail)) || (ac.id === selectedBelugaTail);
  });

  fleetGrid.innerHTML = filteredAircraft.map(ac => {
    const isAirborne = ac.status === 'En Vuelo' || !!ac.airborne;
    const statusText = ac.status || (isAirborne ? 'En Vuelo' : 'En Tierra');
    const routeText = ac.current_site ? `Ubicación: ${ac.current_site}` : (ac.location_label || ac.locationLabel || 'Base Operativa');
    const altText = ac.altitude_ft ? `${Number(ac.altitude_ft).toLocaleString()} ft` : (ac.altitudeFt ? `${Number(ac.altitudeFt).toLocaleString()} ft` : 'En superficie');
    const speedText = ac.speed_kt ? `${ac.speed_kt} kt` : (ac.speedKt ? `${ac.speedKt} kt` : '0 kt');
    const relevance = ac.strike_relevance || (ac.is_spain_connection ? 'Bloqueo HTP Getafe' : 'Circulación Europea');
    const isBlocked = ac.is_spain_connection || (relevance && relevance.includes('Bloqueo'));

    return `
      <div class="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition shadow-md">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-white font-mono flex items-center gap-1.5">
            <i data-lucide="plane" class="w-3.5 h-3.5 ${isAirborne ? 'text-amber-400' : 'text-slate-400'}"></i>
            <span>${ac.name || ac.id}</span>
          </span>
          <span class="px-2 py-0.5 text-[9px] font-extrabold rounded ${isAirborne ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}">${statusText}</span>
        </div>
        <p class="text-xs text-slate-300 font-medium">${routeText}</p>
        <div class="text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span>Vel: <strong>${speedText}</strong></span>
          <span>Alt: <strong>${altText}</strong></span>
        </div>
        <div class="text-[10px] font-mono flex justify-between items-center border-t border-slate-800/80 pt-1.5">
          <span class="text-slate-500">Matrícula: <strong class="text-slate-300">${ac.registration || 'N/A'}</strong></span>
          <span class="px-1.5 py-0.5 text-[8.5px] font-bold rounded ${isBlocked ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'}">${relevance}</span>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function renderBelugaRoutes(beluga) {
  const routesGrid = document.getElementById('beluga-routes-grid');
  const routes = beluga.european_routes || beluga.historical_movements?.european_routes_distribution || [];
  if (routesGrid && routes.length > 0) {
    routesGrid.innerHTML = routes.map(r => {
      const routeName = r.route || `${r.origin} ➔ ${r.destination}`;
      const isBlocked = (r.status && r.status.includes('Bloqueado')) || r.color === 'rose';
      return `
        <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1.5 hover:border-slate-700 transition">
          <div class="flex justify-between items-center">
            <span class="text-[11px] font-bold text-white font-mono">${routeName}</span>
            <span class="px-1.5 py-0.5 text-[9px] font-extrabold rounded ${isBlocked ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'}">${r.status || 'Operativo'}</span>
          </div>
          <div class="text-[10px] text-slate-400 font-medium">
            <span>Componente: <strong class="text-slate-200">${r.component}</strong></span>
          </div>
          ${r.disruption_impact ? `<p class="text-[9.5px] text-amber-400/90 font-mono">${r.disruption_impact}</p>` : ''}
        </div>
      `;
    }).join('');
  }

  const citationsContainer = document.getElementById('beluga-citations-container');
  const citations = beluga.primary_source_citations || [];
  if (citationsContainer && citations.length > 0) {
    citationsContainer.innerHTML = citations.map(c => `
      <div class="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1">
        <div class="flex justify-between items-center">
          <span class="text-[10px] font-bold text-sky-300 font-mono">${c.title}</span>
          <span class="text-[9px] text-slate-500">${c.date}</span>
        </div>
        <blockquote class="text-[10.5px] text-slate-300 italic pl-2 border-l-2 border-amber-500/60 leading-tight">
          "${c.verbatim_excerpt}"
        </blockquote>
        <p class="text-[9.5px] text-slate-400">${c.relevance}</p>
      </div>
    `).join('');
  }
}

function renderBelugaMovements(beluga) {
  const container = document.getElementById('beluga-movements-container');
  const countBadge = document.getElementById('movements-count-badge');
  if (!container) return;

  const movements = beluga.recent_movements || [];
  const filtered = movements.filter(m => {
    if (selectedBelugaTail === 'ALL') return true;
    return (m.registration === selectedBelugaTail) ||
           (m.name && m.name.includes(selectedBelugaTail)) ||
           (m.aircraft_id === selectedBelugaTail);
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} registro${filtered.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-xl space-y-1.5">
        <p class="text-xs font-semibold text-slate-400">Sin movimientos recientes registrados para este criterio.</p>
        <p class="text-[11px] text-slate-500 font-mono">Filtro activo: ${selectedBelugaTail} | Todos los vuelos en tierra o bajo seguimiento.</p>
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

    const corridor = `${m.origin_name} (${m.origin_code}) ➔ ${m.destination_name} (${m.destination_code})`;
    const depTimeFormatted = m.departure_time ? m.departure_time.replace('T', ' ').replace('Z', ' UTC') : 'N/A';

    return `
      <div class="p-3 bg-slate-900/80 border ${isGetafe ? 'border-rose-900/40 bg-rose-950/10' : 'border-slate-800'} rounded-xl space-y-2 hover:border-slate-700 transition shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-sky-400 rounded border border-slate-700">
              ${m.registration || m.name}
            </span>
            <span class="text-xs font-bold text-white font-mono">${m.callsign || 'N/A'}</span>
            <span class="text-[11px] text-slate-400 font-medium">(${m.name || 'BelugaXL'})</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="px-2 py-0.5 text-[9px] font-bold rounded border ${statusBadgeClass}">
              ${m.flight_status || 'Programado'}
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
              <span class="font-mono text-white">${corridor}</span>
            </div>
            <div class="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
              <i data-lucide="clock" class="w-3 h-3 text-slate-500"></i>
              <span>Salida: ${depTimeFormatted}</span>
              ${m.duration_formatted ? `<span class="text-slate-400">(${m.duration_formatted})</span>` : ''}
            </div>
          </div>

          <div class="text-right md:text-right text-[10.5px]">
            <div class="text-slate-400">
              <span class="font-semibold text-slate-300">Carga / Componente:</span>
              <span class="text-amber-300 font-medium">${m.component_payload || 'Componentes Aeronáuticos'}</span>
            </div>
            <div class="text-[10px] text-slate-500 mt-0.5">
              <span>Impacto: <strong class="${isGetafe ? 'text-rose-400' : 'text-sky-400'}">${m.strike_relevance || 'Circulación Europea'}</strong></span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function initBelugaLogistics() {
  const beluga = conflictData?.beluga_logistics;
  if (!beluga) return;
  renderBelugaFleet(beluga);
  renderBelugaRoutes(beluga);
  renderBelugaMovements(beluga);
}

function initThermometer() {
  const thermo = conflictData?.sentiment_thermometer;
  if (!thermo) return;

  const tempEl = document.getElementById('thermo-temp');
  const badgeEl = document.getElementById('thermo-badge');
  const descEl = document.getElementById('thermo-desc');
  const barEl = document.getElementById('thermo-bar');
  const badEl = document.getElementById('thermo-bad-ratio');
  const goodEl = document.getElementById('thermo-good-ratio');

  if (tempEl) tempEl.textContent = `${thermo.temperature_celsius}°C`;
  if (badgeEl) badgeEl.textContent = thermo.status_label;
  if (descEl) descEl.textContent = thermo.status_description;
  if (barEl) barEl.style.width = `${thermo.temperature_celsius}%`;
  if (badEl) badEl.textContent = `${thermo.bad_for_airbus_percentage.toFixed(1)}%`;
  if (goodEl) goodEl.textContent = `${thermo.good_for_airbus_percentage.toFixed(1)}%`;

  thermoFeedData = thermo.feed || [];
  renderThermoFeed(thermoFeedData);
}

let selectedThermoCategory = 'ALL';
let selectedThermoPlatform = 'ALL';

function renderThermoFeed(items) {
  const container = document.getElementById('thermo-feed-container');
  const countBadge = document.getElementById('thermo-feed-count-badge');
  if (!container) return;

  const filtered = items.filter(item => {
    // 1. Filter by category
    if (selectedThermoCategory === 'BAD_FOR_AIRBUS') {
      const isBad = item.category === 'BAD_FOR_AIRBUS' || item.impact === 'BAD_FOR_AIRBUS' || (item.pressure_impact && String(item.pressure_impact).startsWith('+'));
      if (!isBad) return false;
    } else if (selectedThermoCategory === 'GOOD_FOR_AIRBUS') {
      const isGood = item.category === 'GOOD_FOR_AIRBUS' || item.impact === 'GOOD_FOR_AIRBUS' || (item.pressure_impact && String(item.pressure_impact).startsWith('-'));
      if (!isGood) return false;
    }

    // 2. Filter by platform
    if (selectedThermoPlatform !== 'ALL') {
      const p = (item.platform || 'PRENSA').toUpperCase();
      if (p !== selectedThermoPlatform) return false;
    }

    return true;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} publicaciones`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-xl space-y-1.5">
        <p class="text-xs font-semibold text-slate-400">No se encontraron publicaciones con los filtros seleccionados.</p>
        <p class="text-[11px] text-slate-500 font-mono">Filtros: ${selectedThermoCategory} | Plataforma: ${selectedThermoPlatform}</p>
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

    // Platform icons and colors
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

    return `
      <div class="p-4 bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 rounded-xl transition space-y-2 shadow-sm group">
        <div class="flex flex-wrap justify-between items-center gap-1.5">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              <i data-lucide="${platIcon}" class="w-3 h-3 ${platColor}"></i>
              <span>${item.source || platLabel}</span>
            </span>
            <span class="text-[10px] text-slate-500 font-mono">${item.date || 'Reciente'}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="px-2 py-0.5 text-[9.5px] font-mono rounded ${impactBadgeClass}">
              ${impactText}
            </span>
            <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded ${badgeClass}">
              ${isBad ? 'Palanca Huelga' : (isGood ? 'Spin Empresa' : 'Seguimiento')}
            </span>
          </div>
        </div>

        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="text-xs sm:text-sm font-bold text-white group-hover:text-sky-400 transition block leading-snug">
          ${item.title} <i data-lucide="external-link" class="inline w-3 h-3 ml-1 text-slate-500 group-hover:text-sky-400"></i>
        </a>

        <p class="text-xs text-slate-300 leading-relaxed">${item.summary || ''}</p>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function filterThermoFeed(category) {
  selectedThermoCategory = category;

  document.getElementById('btn-feed-all')?.classList.remove('bg-blue-600', 'text-white');
  document.getElementById('btn-feed-bad')?.classList.remove('bg-rose-600', 'text-white');
  document.getElementById('btn-feed-good')?.classList.remove('bg-emerald-600', 'text-white');

  document.getElementById('btn-feed-all')?.classList.add('bg-slate-900', 'text-slate-300');
  document.getElementById('btn-feed-bad')?.classList.add('bg-slate-900', 'text-slate-300');
  document.getElementById('btn-feed-good')?.classList.add('bg-slate-900', 'text-slate-300');

  if (category === 'ALL') {
    document.getElementById('btn-feed-all')?.classList.add('bg-blue-600', 'text-white');
    document.getElementById('btn-feed-all')?.classList.remove('bg-slate-900', 'text-slate-300');
  } else if (category === 'BAD_FOR_AIRBUS') {
    document.getElementById('btn-feed-bad')?.classList.add('bg-rose-600', 'text-white');
    document.getElementById('btn-feed-bad')?.classList.remove('bg-slate-900', 'text-slate-300');
  } else if (category === 'GOOD_FOR_AIRBUS') {
    document.getElementById('btn-feed-good')?.classList.add('bg-emerald-600', 'text-white');
    document.getElementById('btn-feed-good')?.classList.remove('bg-slate-900', 'text-slate-300');
  }

  renderThermoFeed(thermoFeedData);
}

function filterThermoPlatform(platform) {
  selectedThermoPlatform = platform;
  document.querySelectorAll('.feed-plat-pill').forEach(pill => {
    const p = pill.getAttribute('data-platform');
    if (p === platform) {
      pill.className = "feed-plat-pill px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white transition whitespace-nowrap flex items-center gap-1";
    } else {
      pill.className = "feed-plat-pill px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition whitespace-nowrap flex items-center gap-1";
    }
  });

  renderThermoFeed(thermoFeedData);
}
function startBelugaLivePolling() {
  if (belugaPollingInterval) clearInterval(belugaPollingInterval);
  belugaPollingInterval = setInterval(async () => {
    try {
      const res = await fetch('data/beluga_status.json', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (conflictData) {
          conflictData.beluga_logistics = data;
          initBelugaLogistics();
        }
      }
    } catch (e) {}
  }, 30000);
}

// ==================== SOURCES (ALL 269 SOURCES + MODAL VIEWER) ====================
function normalizeCategory(cat) {
  if (!cat) return 'Prensa & Medios';
  if (cat.includes('Actas') || cat.includes('Legal')) return 'Actas SIMA & Legal';
  if (cat.includes('Dossier') || cat.includes('Salarial') || cat.includes('Económico')) return 'Dossiers Económicos';
  if (cat.includes('Airbus SE') || cat.includes('Financier')) return 'Informes Airbus SE';
  if (cat.includes('Convenio') || cat.includes('BOE')) return 'Convenios & BOE';
  if (cat.includes('Comunicado') || cat.includes('Huelga')) return 'Comunicados Sindicales';
  if (cat.includes('Cadena') || cat.includes('Logística') || cat.includes('JIT') || cat.includes('Suministro')) return 'Cadena JIT & Logística';
  if (cat.includes('Benchmark') || cat.includes('Internacional')) return 'Benchmark';
  if (cat.includes('Prensa') || cat.includes('Medios') || cat.includes('Noticia')) return 'Prensa & Medios';
  return 'Prensa & Medios';
}

function initSources() {
  renderSourcesList(getFilteredSources());
}

function setSourceCategory(category) {
  selectedSourceCategory = category;

  document.querySelectorAll('.source-cat-pill').forEach(pill => {
    const pillCat = pill.getAttribute('data-cat');
    if (pillCat === category) {
      pill.className = "source-cat-pill px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white whitespace-nowrap transition";
    } else {
      pill.className = "source-cat-pill px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 whitespace-nowrap border border-slate-800 transition";
    }
  });

  renderSourcesList(getFilteredSources());
}

function filterSources() {
  renderSourcesList(getFilteredSources());
}

let currentSourceSort = 'relevance';
let onlyFeaturedSources = false;

function setSourceSort(sortVal) {
  currentSourceSort = sortVal;
  renderSourcesList(getFilteredSources());
}

function toggleFeaturedSourcesOnly() {
  onlyFeaturedSources = !onlyFeaturedSources;
  const btn = document.getElementById('btn-filter-featured');
  if (btn) {
    if (onlyFeaturedSources) {
      btn.className = "px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 transition flex items-center gap-1";
    } else {
      btn.className = "px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition flex items-center gap-1";
    }
  }
  renderSourcesList(getFilteredSources());
}

function getFilteredSources() {
  const query = document.getElementById('source-search')?.value.toLowerCase().trim() || '';
  
  let result = sourcesCatalogData.filter(s => {
    const normCat = normalizeCategory(s.category);
    const matchesCat = (selectedSourceCategory === 'ALL') || (normCat === selectedSourceCategory) || (s.category === selectedSourceCategory);
    
    if (!matchesCat) return false;

    if (onlyFeaturedSources) {
      const isKeyCategory = (normCat === 'Actas SIMA & Legal' || normCat === 'Convenios & BOE' || normCat === 'Informes Airbus SE');
      const isLongDoc = (s.char_count && s.char_count > 4000);
      const isKeyId = (s.id && (s.id.includes('sima') || s.id.includes('convenio') || s.id.includes('airbus_2025')));
      if (!isKeyCategory && !isLongDoc && !isKeyId) return false;
    }

    if (!query) return true;

    const title = (s.title || '').toLowerCase();
    const id = (s.id || '').toLowerCase();
    const summary = (s.summary || '').toLowerCase();
    const type = (s.type || '').toLowerCase();
    const url = (s.url || '').toLowerCase();

    return title.includes(query) || id.includes(query) || summary.includes(query) || type.includes(query) || url.includes(query);
  });

  // Apply Sorting
  if (currentSourceSort === 'title_asc') {
    result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else if (currentSourceSort === 'title_desc') {
    result.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
  } else if (currentSourceSort === 'chars_desc') {
    result.sort((a, b) => (b.char_count || 0) - (a.char_count || 0));
  } else if (currentSourceSort === 'category') {
    result.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
  }

  return result;
}

function renderSourcesList(sources) {
  const container = document.getElementById('sources-list');
  const countBadge = document.getElementById('sources-count-badge');
  if (countBadge) countBadge.textContent = `${sources.length} Fuentes`;
  if (!container) return;

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
          <button onclick="openSourceModal('${cleanId}')" class="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg text-xs font-bold transition flex items-center">
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

// Modal Reader Functions
async function openSourceModal(sourceId) {
  const tgDocs = telegramDocsData.length > 0 ? telegramDocsData : (conflictData?.telegram_archive?.documents || []);

  let source = sourcesCatalogData.find(s => {
    const cleanId = (s.id || '').replace(/[^a-zA-Z0-9_-]/g, '_');
    return cleanId === sourceId || s.id === sourceId || s.title === sourceId;
  });

  let isTg = false;
  if (!source) {
    source = tgDocs.find(d => {
      const cleanId = (d.id || '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const cleanTitle = (d.title || '').replace(/[^a-zA-Z0-9_-]/g, '_');
      return cleanId === sourceId || cleanTitle === sourceId || d.id === sourceId || d.title === sourceId;
    });
    if (source) isTg = true;
  }

  const modalEl = document.getElementById('source-modal');
  const titleEl = document.getElementById('modal-source-title');
  const catEl = document.getElementById('modal-source-category');
  const typeEl = document.getElementById('modal-source-type');
  const sizeEl = document.getElementById('modal-source-size');
  const contentEl = document.getElementById('modal-source-content');
  const linkEl = document.getElementById('modal-source-link');
  const metaEl = document.getElementById('modal-source-footer-meta');

  if (!source) return;
  currentModalSource = source;

  if (titleEl) titleEl.textContent = source.title;
  if (catEl) catEl.textContent = normalizeCategory(source.category);
  if (typeEl) typeEl.textContent = isTg ? 'TELEGRAM OFICIAL' : (source.type ? source.type.toUpperCase() : 'DOCUMENTO');
  if (sizeEl) sizeEl.textContent = source.char_count ? `${source.char_count.toLocaleString()} caracteres` : (source.size_chars ? `${(source.size_chars/1000).toFixed(1)}k caracteres` : '');
  if (metaEl) metaEl.textContent = isTg ? `Canal: EnfadadosconAirbus (${source.file_path || 'Telegram'})` : `ID Fuente: ${source.id || sourceId}`;

  if (linkEl) {
    const destUrl = source.url || source.group_url || (isTg ? 'https://t.me/+MnuqJDCAAgYyMGQ0' : '#');
    linkEl.href = sanitizeURL(destUrl);
    linkEl.classList.remove('hidden');
  }

  if (contentEl) {
    // 1. Immediate display of embedded full text or preview
    if (source.fulltext_preview && source.fulltext_preview.length > 50) {
      contentEl.textContent = source.fulltext_preview;
    } else if (source.summary) {
      contentEl.textContent = source.summary;
    } else {
      contentEl.textContent = "Cargando texto completo...";
    }

    // 2. Fetch external text file if served over HTTP
    if (window.location.protocol !== 'file:' && source.file_path) {
      try {
        const relPath = source.file_path.startsWith('http') ? source.file_path : (source.file_path.startsWith('data/') || source.file_path.startsWith('sources/') ? source.file_path : `data/${source.file_path}`);
        const res = await fetch(relPath);
        if (res.ok) {
          const text = await res.text();
          if (text && text.trim().length > 0) {
            contentEl.textContent = text;
          }
        }
      } catch (e) {}
    }
  }

  if (modalEl) modalEl.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeSourceModal() {
  const modalEl = document.getElementById('source-modal');
  if (modalEl) modalEl.classList.add('hidden');
}

function copyModalText() {
  const contentEl = document.getElementById('modal-source-content');
  if (!contentEl) return;
  navigator.clipboard.writeText(contentEl.textContent).then(() => {
    alert("Texto copiado al portapapeles con éxito.");
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = contentEl.textContent;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert("Texto copiado al portapapeles.");
  });
}

// ==================== TELEGRAM ARCHIVE EXPLORER ====================
function initTelegramArchive() {
  const tg = conflictData?.telegram_archive;
  if (!tg || !tg.documents) return;

  telegramDocsData = tg.documents;
  const countEl = document.getElementById('tg-docs-count');
  if (countEl) countEl.textContent = `${telegramDocsData.length} archivos indexados`;

  renderTelegramDocs(telegramDocsData);
}
function normalizeTgCategory(cat) {
  if (!cat) return 'Planes de Mantenimiento';
  if (cat.includes('Minuta') || cat.includes('Asamblea') || cat.includes('Acta')) return 'Actas de Asamblea';
  if (cat.includes('Comunicado') || cat.includes('Huelga') || cat.includes('Sindical')) return 'Comunicados & Huelga';
  if (cat.includes('Dossier') || cat.includes('Tabla') || cat.includes('Económico') || cat.includes('Técnico')) return 'Dossiers & Tablas';
  if (cat.includes('Legal') || cat.includes('SIMA') || cat.includes('Jurídico') || cat.includes('Sentencia')) return 'Jurídico & Sentencias';
  if (cat.includes('Mantenimiento') || cat.includes('Plan') || cat.includes('General')) return 'Planes de Mantenimiento';
  return 'Planes de Mantenimiento';
}

function setTgCategory(category) {
  selectedTgCategory = category;

  document.querySelectorAll('.tg-cat-pill').forEach(pill => {
    const pillCat = pill.getAttribute('data-tgcat');
    if (pillCat === category) {
      pill.className = "tg-cat-pill px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-600 text-white whitespace-nowrap transition";
    } else {
      pill.className = "tg-cat-pill px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 whitespace-nowrap border border-slate-800 transition";
    }
  });

  renderTelegramDocs(getFilteredTelegramDocs());
}

function filterTelegramDocs() {
  renderTelegramDocs(getFilteredTelegramDocs());
}

function getFilteredTelegramDocs() {
  const query = document.getElementById('tg-doc-search')?.value.toLowerCase().trim() || '';

  return telegramDocsData.filter(d => {
    const normCat = normalizeTgCategory(d.category);
    const matchesCat = (selectedTgCategory === 'ALL') || (normCat === selectedTgCategory) || (d.category === selectedTgCategory);
    if (!matchesCat) return false;
    if (!query) return true;

    return (d.title || '').toLowerCase().includes(query) || 
           (d.category || '').toLowerCase().includes(query) || 
           (d.summary || '').toLowerCase().includes(query) ||
           normCat.toLowerCase().includes(query);
  });
}

function renderTelegramDocs(docs) {
  const container = document.getElementById('telegram-docs-list');
  if (!container) return;

  if (docs.length === 0) {
    container.innerHTML = `<div class="text-center py-8 text-xs text-slate-500">No se encontraron documentos con ese criterio de búsqueda.</div>`;
    return;
  }

  container.innerHTML = docs.map(doc => {
    const safeTitle = escapeHTML(doc.title);
    const safeCategory = escapeHTML(doc.category);
    const safeSummary = escapeHTML(doc.summary);
    const safeDate = escapeHTML(doc.date);
    const cleanDocId = escapeHTML((doc.id || doc.title || '').replace(/[^a-zA-Z0-9_-]/g, '_'));
    const safeFilePath = sanitizeURL(doc.file_path);

    return `
      <div class="p-3.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-xl transition flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div class="space-y-1">
          <div class="flex items-center space-x-2">
            <span class="px-2 py-0.5 text-[9px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded">${safeCategory}</span>
            <span class="text-xs text-slate-400 font-mono">${safeDate}</span>
            <span class="text-[10px] text-slate-500 font-mono">${(doc.size_chars ? (doc.size_chars/1000).toFixed(1) : 0)}k caracteres</span>
          </div>
          <h5 class="text-xs font-bold text-white">${safeTitle}</h5>
          <p class="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">${safeSummary}</p>
        </div>
        <div class="flex items-center space-x-2 shrink-0">
          <button onclick="openSourceModal('${cleanDocId}')" class="px-2.5 py-1.5 bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 rounded-lg text-xs font-bold transition flex items-center">
            <i data-lucide="eye" class="w-3.5 h-3.5 mr-1 text-sky-400"></i>
            Ver Texto
          </button>
          <a href="${safeFilePath}" download class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center">
            <i data-lucide="download" class="w-3.5 h-3.5 mr-1 text-slate-400"></i>
            Descargar
          </a>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// ==================== DYNAMIC ISLAND & FLOATING HUD ====================
function initFloatingHUD() {
  const hud = document.getElementById('floating-hud');
  const scrollPercentageEl = document.getElementById('scroll-percentage');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // Dynamic Island contraction / expansion
    if (hud) {
      if (scrollTop > 120) {
        hud.classList.add('scale-95', 'opacity-95');
      } else {
        hud.classList.remove('scale-95', 'opacity-95');
      }
    }

    // Calculate scroll percentage for dock
    if (scrollPercentageEl && scrollHeight > 0) {
      const pct = Math.min(100, Math.max(0, Math.round((scrollTop / scrollHeight) * 100)));
      scrollPercentageEl.textContent = `${pct}%`;
    }
  }, { passive: true });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openGlassModal(title, contentHtml) {
  const modal = document.getElementById('glass-detail-modal');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  if (!modal || !titleEl || !bodyEl) return;
  
  titleEl.innerHTML = title;
  bodyEl.innerHTML = contentHtml;
  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  if (window.lucide) lucide.createIcons();
}

function closeGlassModal() {
  const modal = document.getElementById('glass-detail-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

function openQuickCalcModal() {
  const html = `
    <div class="space-y-4">
      <p class="text-xs text-slate-400">Simula tu descuento salarial neto por días de paro frente a la recuperación garantizada del VII Convenio (7.500 € + 12% en tablas).</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <label class="block text-xs font-semibold text-slate-300">Salario Bruto Anual (€):</label>
          <input type="number" id="modal-input-salary" value="45000" step="1000" class="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-sky-400 focus:outline-none" oninput="syncModalCalculator()">
        </div>
        <div class="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div class="flex justify-between items-center text-xs">
            <span class="font-semibold text-slate-300">Días de Huelga:</span>
            <span id="modal-strike-days-val" class="font-mono font-bold text-sky-400">5 días</span>
          </div>
          <input type="range" id="modal-slider-strike-days" min="1" max="30" value="5" class="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-400 mt-2" oninput="syncModalCalculator()">
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
        <div class="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
          <span class="text-[10px] text-rose-300/80 block uppercase tracking-wider">Descuento Neto</span>
          <span id="modal-net-strike-cost" class="text-base font-bold text-rose-400">-443 €</span>
        </div>
        <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
          <span class="text-[10px] text-amber-300/80 block uppercase tracking-wider">Pérdida IPC (20-25)</span>
          <span class="text-base font-bold text-amber-400">-26.027 €</span>
        </div>
        <div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <span class="text-[10px] text-emerald-300/80 block uppercase tracking-wider">Recuperación Plataforma</span>
          <span id="modal-recovery-val" class="text-base font-bold text-emerald-400">+12.900 €</span>
        </div>
      </div>
      <div class="flex justify-end pt-2">
        <button onclick="switchTab('tab-purchasing-power'); closeGlassModal();" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-blue-600/30">
          <span>Ir al Simulador Salarial Completo</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `;
  openGlassModal('<i data-lucide="calculator" class="w-5 h-5 text-emerald-400"></i> Calculadora Salarial Rápida & ROI', html);
  syncModalCalculator();
}

function syncModalCalculator() {
  const salaryInput = document.getElementById('modal-input-salary');
  const daysSlider = document.getElementById('modal-slider-strike-days');
  const daysVal = document.getElementById('modal-strike-days-val');
  const netStrikeCost = document.getElementById('modal-net-strike-cost');
  const recoveryVal = document.getElementById('modal-recovery-val');

  if (!salaryInput || !daysSlider) return;
  const salary = parseFloat(salaryInput.value) || 45000;
  const days = parseInt(daysSlider.value, 10) || 5;

  if (daysVal) daysVal.textContent = `${days} día${days > 1 ? 's' : ''}`;
  const dailyGross = salary / 365.0;
  const dailyNet = dailyGross * 0.72;
  const totalNetLoss = dailyNet * days;
  if (netStrikeCost) netStrikeCost.textContent = `-${Math.round(totalNetLoss).toLocaleString()} €`;
  const recoveryEstimate = 7500 + (salary * 0.12);
  if (recoveryVal) recoveryVal.textContent = `+${Math.round(recoveryEstimate).toLocaleString()} €`;
}

function toggleQuickCalculatorDrawer() {
  openQuickCalcModal();
}

function syncDrawerCalculator() {
  syncModalCalculator();
}

// Global key listeners for modal closing
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeGlassModal();
    closeSourceModal();
  }
});

document.addEventListener('click', (e) => {
  const glassModal = document.getElementById('glass-detail-modal');
  if (glassModal && !glassModal.classList.contains('hidden') && e.target === glassModal) {
    closeGlassModal();
  }
});
