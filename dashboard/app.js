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
let asymmetryChart = null;
let wagesChart = null;
let belugaHistoryChart = null;
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

  // 7. Support direct deep-linking via URL hash (e.g. #tab-sources, #tab-timeline)
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && document.getElementById(initialHash)) {
    switchTab(initialHash);
  }
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(hash)) {
      switchTab(hash);
    }
  });

  // 8. Lifecycle Management: Pause polling on tab hidden to preserve battery and network
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
});

function initAllModules() {
  initBenchmarks();
  initSources();
  initWorkflows();
  initHistoricalLosses();
  initNegotiationEvolution();
  initTimeline();
  initTelegramArchive();
  initThermometerAndBeluga();
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
    initHistoricalLosses();
    initNegotiationEvolution();
    initTimeline();
    initWorkflows();
    initTelegramArchive();
    initThermometerAndBeluga();
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
        initThermometerAndBeluga();
      }
    }
  } catch (e) {
    console.warn('Beluga fetch offline, re-rendering cache:', e);
    initThermometerAndBeluga();
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
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('bg-blue-600', 'text-white', 'font-bold', 'shadow-md', 'shadow-blue-600/30');
    btn.classList.add('text-slate-400');
  });

  const activeTab = document.getElementById(normalizedTabId);
  const activeBtn = document.getElementById(`btn-${normalizedTabId}`);
  if (activeTab) activeTab.classList.remove('hidden');
  if (activeBtn) {
    activeBtn.classList.remove('text-slate-400');
    activeBtn.classList.add('bg-blue-600', 'text-white', 'font-bold', 'shadow-md', 'shadow-blue-600/30');
  }

  // Update URL hash smoothly
  try {
    if (history.replaceState) {
      history.replaceState(null, null, `#${normalizedTabId}`);
    }
  } catch (e) {}

  // Close mobile drawer on item click
  const sidebar = document.getElementById('sidebar-menu');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar && !sidebar.classList.contains('-translate-x-full') && window.innerWidth < 1024) {
    sidebar.classList.add('-translate-x-full');
    if (backdrop) {
      backdrop.classList.remove('opacity-100');
      backdrop.classList.add('opacity-0', 'pointer-events-none');
    }
  }

  // Schedule chart initializations after DOM unhides
  requestAnimationFrame(() => {
    setTimeout(() => {
      if (normalizedTabId === 'tab-overview') {
        initAsymmetryChart();
        updateAsymmetrySimulation();
        initAirbusStockChart();
        initCompanyHealthCharts();
      } else if (normalizedTabId === 'tab-industrial') {
        initBelugaHistoryChart();
        initThermometerAndBeluga();
      } else if (normalizedTabId === 'tab-purchasing-power') {
        initWagesChart();
        updateWageSimulation();
        initHistoricalLosses();
        initNegotiationEvolution();
      } else if (normalizedTabId === 'tab-union-force') {
        initUnionCharts();
        initTimeline();
        initWorkflows();
      } else if (normalizedTabId === 'tab-evidence') {
        initSources();
        initTelegramArchive();
        initBenchmarks();
      }
      if (window.lucide) lucide.createIcons();
    }, 60);
  });
}
// ==================== ASYMMETRY SIMULATOR ====================
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
  const ctx = document.getElementById('asymmetryChart')?.getContext('2d');
  if (!ctx) return;

  const days = [1, 3, 5, 7, 10, 15, 20, 30];
  const airbusLoss = [6.5, 19.5, 52.5, 97.9, 166.0, 279.5, 393.0, 620.0];
  const platformCost = [239, 239, 239, 239, 239, 239, 239, 239];
  const payrollSaved = [2.1, 6.4, 10.7, 14.9, 21.3, 32.0, 42.6, 63.9];

  if (asymmetryChart) asymmetryChart.destroy();

  asymmetryChart = new Chart(ctx, {
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
  });
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

function updateWageSimulation() {
  const salaryInput = document.getElementById('sim-salary');
  if (!salaryInput) return;
  const curSalary = parseFloat(salaryInput.value) || 50000;

  const badgeEl = document.getElementById('sim-salary-badge');
  if (badgeEl) badgeEl.textContent = `${curSalary.toLocaleString()} €`;

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

  // --- SCENARIO 2: PREACUERDO SIMA (+9.5% consolidado, 5.000 € atrasos, teletrabajo 30€/m, 100% IPC diferido) ---
  const medBaseSalary = curSalary * 1.095;
  const medMonthlyIncrease = (medBaseSalary - curSalary) / 14.0;
  const medArrears = 5000;
  const medSeniority = medBaseSalary * seniorityPct;
  const medShiftPlus = medBaseSalary * shiftPct;
  const medPension = medBaseSalary * (pensionRate + 0.005);
  const medTelework = teleworkDays > 0 ? (teleworkDays * 18 * 12) : 0;
  const medBradford = 400;
  const medNetTotalGain = (medBaseSalary - curSalary) * (1 - taxRate) + (medArrears * (1 - taxRate)) + (medPension - curPension) + (medSeniority - curSeniority) + (medShiftPlus - curShiftPlus) + medTelework + medBradford;

  // 5-Year Macro Trajectory for SIMA (100% IPC anual diferido):
  const medNomYear1 = medBaseSalary;
  const medNomYear5 = medNomYear1 * Math.pow(1 + ipcRate, 4);
  const medRealYear5 = medNomYear5 / cumDeflator4yr; // Exactly medNomYear1
  const medRealGainPct = ((medRealYear5 / curSalary) - 1) * 100;

  // --- SCENARIO 3: PLATAFORMA DEL COMITÉ (+12% íntegro, 7.500 € atrasos, 5.5% pensiones, Bradford refund, 60€/m teletrabajo, RSG = IPC + 1.5% sin techo) ---
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
  const medNetMonthlyIncrease = medMonthlyIncrease * (1 - taxRate);
  const unionNetMonthlyIncrease = unionMonthlyIncrease * (1 - taxRate);

  // Update Scenario 1 UI
  setText('scen-co-salary', `${Math.round(coBaseSalary).toLocaleString()} €`);
  setText('scen-co-salary-5yr', `${Math.round(coNomYear5).toLocaleString()} €`);
  setText('scen-co-real-5yr', `${Math.round(coRealYear5).toLocaleString()} € (${coRealLossPct.toFixed(1).replace('.', ',')}%)`);
  setText('scen-co-loss-badge', `${coRealLossPct.toFixed(1).replace('.', ',')}%`);
  setText('scen-co-monthly', `+${Math.round(coMonthlyIncrease).toLocaleString()} €/mes`);
  setText('scen-co-net-monthly', `+${Math.round(coNetMonthlyIncrease).toLocaleString()} €/mes`);
  setText('scen-co-net-total', `+${Math.round(coNetTotalGain).toLocaleString()} €`);

  // Update Scenario 2 UI
  setText('scen-med-salary', `${Math.round(medBaseSalary).toLocaleString()} €`);
  setText('scen-med-salary-5yr', `${Math.round(medNomYear5).toLocaleString()} €`);
  setText('scen-med-real-5yr', `${Math.round(medRealYear5).toLocaleString()} € (+${medRealGainPct.toFixed(1).replace('.', ',')}%)`);
  setText('scen-med-monthly', `+${Math.round(medMonthlyIncrease).toLocaleString()} €/mes`);
  setText('scen-med-net-monthly', `+${Math.round(medNetMonthlyIncrease).toLocaleString()} €/mes`);
  setText('scen-med-net-total', `+${Math.round(medNetTotalGain).toLocaleString()} €`);

  // Update Scenario 3 UI
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

  // Update Strike ROI
  setText('roi-strike-days-label', `${strikeDays} días`);
  setText('roi-strike-cost', `-${Math.round(totalStrikeCost).toLocaleString()} € netos`);
  setText('roi-monthly-gain', `+${Math.round(netMonthlyGainInPocket).toLocaleString()} € netos/mes`);
  setText('roi-amortization-time', strikeDays === 0 ? '0 días' : `${amortizationMonths.toFixed(1)} meses (${Math.round(amortizationMonths * 4.3)} semanas)`);
  setText('roi-5yr-gain', `+${Math.round(gain5Years).toLocaleString()} €`);

  // Update 5-Year Cumulative Projection Chart
  updateWagesChart(curSalary, coBaseSalary, unionBaseSalary, coArrears, unionArrears, activeUnionEaDeductionGross, ipcRate, coEaLossQ1);
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function initWagesChart() {
  const ctx = document.getElementById('wagesChart')?.getContext('2d');
  if (!ctx) return;

  if (wagesChart) wagesChart.destroy();

  wagesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['2025 (Base)', '2026 (Año 1)', '2027 (Año 2)', '2028 (Año 3)', '2029 (Año 4)', '2030 (Año 5)'],
      datasets: [
        {
          label: 'Plataforma Comité (Nominal con IPC + 1,5% RSG + Atrasos)',
          data: [50000, 113500, 171420, 231450, 293670, 358150],
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
          label: 'Oferta Empresa (Nominal Fraccionada + Paga Única 2k€)',
          data: [50000, 104500, 157090, 210730, 265440, 321250],
          borderColor: '#f43f5e',
          borderDash: [5, 4],
          borderWidth: 2.5,
          tension: 0.2,
          pointRadius: 3,
          pointBackgroundColor: '#f43f5e',
          fill: false
        },
        {
          label: 'Oferta Empresa (Poder Adquisitivo Real Deflactado por IPC)',
          data: [50000, 102000, 151500, 201200, 250500, 298000],
          borderColor: '#f59e0b',
          borderDash: [3, 3],
          borderWidth: 2,
          tension: 0.2,
          pointRadius: 3,
          pointBackgroundColor: '#f59e0b',
          fill: false
        },
        {
          label: 'Sin Huelga / Congelación (Poder Real Deflactado)',
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
  });
}

function updateWagesChart(cur, co, union, coArrears = 2000, unionArrears = 7500, unionEaDeduction = 0, ipcRate = 0.025, coEaLossQ1 = 625) {
  if (!wagesChart) return;

  const y0 = cur;
  const cumDeflator1 = 1 + ipcRate;
  const cumDeflator2 = Math.pow(1 + ipcRate, 2);
  const cumDeflator3 = Math.pow(1 + ipcRate, 3);
  const cumDeflator4 = Math.pow(1 + ipcRate, 4);
  const cumDeflator5 = Math.pow(1 + ipcRate, 5);

  // Baseline (without agreement, real deflated earnings)
  const base_nom_y1 = cur;
  const base_nom_y2 = cur;
  const base_nom_y3 = cur;
  const base_nom_y4 = cur;
  const base_nom_y5 = cur;

  const base_cum_real_y1 = y0 + (base_nom_y1 / cumDeflator1);
  const base_cum_real_y2 = base_cum_real_y1 + (base_nom_y2 / cumDeflator2);
  const base_cum_real_y3 = base_cum_real_y2 + (base_nom_y3 / cumDeflator3);
  const base_cum_real_y4 = base_cum_real_y3 + (base_nom_y4 / cumDeflator4);
  const base_cum_real_y5 = base_cum_real_y4 + (base_nom_y5 / cumDeflator5);

  // Company Offer (Nominal & Real Deflated)
  const co_nom_y1 = (co - coEaLossQ1) + coArrears;
  const co_nom_y2 = (co) * (1 + Math.min(ipcRate * 0.25, 0.01));
  const co_nom_y3 = co_nom_y2 * (1 + Math.min(ipcRate * 0.25, 0.01));
  const co_nom_y4 = co_nom_y3 * (1 + Math.min(ipcRate * 0.25, 0.01));
  const co_nom_y5 = co_nom_y4 * (1 + Math.min(ipcRate * 0.25, 0.01));

  const co_cum_nom_y1 = y0 + co_nom_y1;
  const co_cum_nom_y2 = co_cum_nom_y1 + co_nom_y2;
  const co_cum_nom_y3 = co_cum_nom_y2 + co_nom_y3;
  const co_cum_nom_y4 = co_cum_nom_y3 + co_nom_y4;
  const co_cum_nom_y5 = co_cum_nom_y4 + co_nom_y5;

  const co_cum_real_y1 = y0 + (co_nom_y1 / cumDeflator1);
  const co_cum_real_y2 = co_cum_real_y1 + (co_nom_y2 / cumDeflator2);
  const co_cum_real_y3 = co_cum_real_y2 + (co_nom_y3 / cumDeflator3);
  const co_cum_real_y4 = co_cum_real_y3 + (co_nom_y4 / cumDeflator4);
  const co_cum_real_y5 = co_cum_real_y4 + (co_nom_y5 / cumDeflator5);

  // Union Platform (Nominal with compounding IPC + 1.5% RSG)
  const un_nom_y1 = (union - unionEaDeduction) + unionArrears;
  const un_nom_y2 = (union) * (1 + ipcRate + 0.015);
  const un_nom_y3 = un_nom_y2 * (1 + ipcRate + 0.015);
  const un_nom_y4 = un_nom_y3 * (1 + ipcRate + 0.015);
  const un_nom_y5 = un_nom_y4 * (1 + ipcRate + 0.015);

  const un_cum_nom_y1 = y0 + un_nom_y1;
  const un_cum_nom_y2 = un_cum_nom_y1 + un_nom_y2;
  const un_cum_nom_y3 = un_cum_nom_y2 + un_nom_y3;
  const un_cum_nom_y4 = un_cum_nom_y3 + un_nom_y4;
  const un_cum_nom_y5 = un_cum_nom_y4 + un_nom_y5;

  wagesChart.data.datasets[0].data = [y0, Math.round(un_cum_nom_y1), Math.round(un_cum_nom_y2), Math.round(un_cum_nom_y3), Math.round(un_cum_nom_y4), Math.round(un_cum_nom_y5)];
  wagesChart.data.datasets[1].data = [y0, Math.round(co_cum_nom_y1), Math.round(co_cum_nom_y2), Math.round(co_cum_nom_y3), Math.round(co_cum_nom_y4), Math.round(co_cum_nom_y5)];
  wagesChart.data.datasets[2].data = [y0, Math.round(co_cum_real_y1), Math.round(co_cum_real_y2), Math.round(co_cum_real_y3), Math.round(co_cum_real_y4), Math.round(co_cum_real_y5)];
  wagesChart.data.datasets[3].data = [y0, Math.round(base_cum_real_y1), Math.round(base_cum_real_y2), Math.round(base_cum_real_y3), Math.round(base_cum_real_y4), Math.round(base_cum_real_y5)];
  wagesChart.update();
}

// ==================== STOCK MARKET & SHARE PRICE CHART ====================
function initAirbusStockChart() {
  const ctx = document.getElementById('airbusStockChart')?.getContext('2d');
  if (!ctx) return;

  if (airbusStockChart) airbusStockChart.destroy();

  const stockData = conflictData?.stock_market_analysis?.daily_history_conflict || [];
  if (stockData.length === 0) return;

  const labels = stockData.map(d => {
    const parts = d.date.split('-');
    return `${parts[2]}/${parts[1]}`;
  });
  const prices = stockData.map(d => d.price);
  const events = stockData.map(d => d.event);

  airbusStockChart = new Chart(ctx, {
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
          pointRadius: stockData.map((d, i) => (i === 6 || i === 8 || i === 13 || i === 16 || i === stockData.length - 1) ? 6 : 3),
          pointBackgroundColor: stockData.map((d, i) => (i === 6 || i === 8 || i === 13 || i === 16 || i === stockData.length - 1) ? '#fb7185' : '#f43f5e'),
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
  });
}

// ==================== COMPANY FINANCIAL HEALTH CHARTS ====================
function initCompanyHealthCharts() {
  initCompanyRevenueChart();
  initCompanyDeliveriesChart();
  initShareholderPieChart();
}

function initCompanyRevenueChart() {
  const ctx = document.getElementById('companyRevenueChart')?.getContext('2d');
  if (!ctx) return;

  if (companyRevenueChart) companyRevenueChart.destroy();

  const history = conflictData?.company_financial_health?.financial_history_2020_2026 || [];
  if (history.length === 0) return;

  const labels = history.map(h => h.year);
  const revenues = history.map(h => h.revenue_eur_m);
  const netIncomes = history.map(h => h.net_income_eur_m);

  companyRevenueChart = new Chart(ctx, {
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
  });
}

function initCompanyDeliveriesChart() {
  const ctx = document.getElementById('companyDeliveriesChart')?.getContext('2d');
  if (!ctx) return;

  if (companyDeliveriesChart) companyDeliveriesChart.destroy();

  const history = conflictData?.company_financial_health?.financial_history_2020_2026 || [];
  if (history.length === 0) return;

  const labels = history.map(h => h.year);
  const deliveries = history.map(h => h.deliveries);

  companyDeliveriesChart = new Chart(ctx, {
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
  });
}

function initShareholderPieChart() {
  const ctx = document.getElementById('shareholderPieChart')?.getContext('2d');
  if (!ctx) return;

  if (shareholderPieChart) shareholderPieChart.destroy();

  const shareholders = conflictData?.company_financial_health?.shareholder_structure || [];
  if (shareholders.length === 0) return;

  const labels = shareholders.map(s => s.entity);
  const pcts = shareholders.map(s => s.pct);
  const colors = shareholders.map(s => s.color || '#38bdf8');

  shareholderPieChart = new Chart(ctx, {
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
  });
}
// ==================== TRADE UNION & SOCIAL LANDSCAPE CHARTS ====================
function initUnionCharts() {
  initUnionShareChart();
  initUnionEvolutionChart();
  initSiteDelegatesChart();
  initReferendumPieChart();
  initReferendumSitesChart();
  initUnionSitesBreakdown();
}

function initUnionShareChart() {
  const ctx = document.getElementById('unionShareChart')?.getContext('2d');
  if (!ctx) return;

  if (unionShareChart) unionShareChart.destroy();

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

  unionShareChart = new Chart(ctx, {
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
  });
}

function initUnionEvolutionChart() {
  const ctx = document.getElementById('unionEvolutionChart')?.getContext('2d');
  if (!ctx) return;

  if (unionEvolutionChart) unionEvolutionChart.destroy();

  const history = conflictData?.trade_union_representation?.historical_evolution || [
    { period: "2010 - 2015", ccoo_pct: 46.5, ugt_pct: 34.0, sipa_pct: 0.0, cgt_pct: 11.5, atp_pct: 5.0, util_pct: 3.0 },
    { period: "2015 - 2019", ccoo_pct: 42.0, ugt_pct: 30.5, sipa_pct: 9.5, cgt_pct: 9.0, atp_pct: 6.0, util_pct: 3.0 },
    { period: "2019 - 2023", ccoo_pct: 38.2, ugt_pct: 26.0, sipa_pct: 16.0, cgt_pct: 8.8, atp_pct: 7.0, util_pct: 4.0 },
    { period: "2023 - 2026", ccoo_pct: 38.38, ugt_pct: 18.18, atp_pct: 15.66, sipa_pct: 15.15, cgt_pct: 12.63, util_pct: 0.0 }
  ];

  const periods = history.map(h => h.period);

  unionEvolutionChart = new Chart(ctx, {
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
  });
}

function initSiteDelegatesChart() {
  const ctx = document.getElementById('siteDelegatesChart')?.getContext('2d');
  if (!ctx) return;

  if (siteDelegatesChart) siteDelegatesChart.destroy();

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

  siteDelegatesChart = new Chart(ctx, {
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
  });
}

function initReferendumPieChart() {
  const ctx = document.getElementById('referendumPieChart')?.getContext('2d');
  if (!ctx) return;

  if (referendumPieChart) referendumPieChart.destroy();

  referendumPieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Voto NO (Rechazo)', 'Voto SÍ (Aprobación)', 'Votos Blanco / Nulos'],
      datasets: [
        {
          data: [49.15, 45.95, 4.62],
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
              const votes = context.dataIndex === 0 ? '6.229 votos' : (context.dataIndex === 1 ? '5.823 votos' : '585 votos');
              return ` ${label}: ${val}% (${votes})`;
            }
          }
        }
      },
      cutout: '55%'
    }
  });
}

function initReferendumSitesChart() {
  const ctx = document.getElementById('referendumSitesChart')?.getContext('2d');
  if (!ctx) return;

  if (referendumSitesChart) referendumSitesChart.destroy();

  const sites = conflictData?.trade_union_representation?.site_breakdown || [];
  // Sort by highest NO percentage to highlight the strongholds of rejection
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

  referendumSitesChart = new Chart(ctx, {
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
          ticks: { color: '#e2e8f0', font: { weight: 'bold', size: 10 } }
        },
        y: {
          max: 100,
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: { color: '#94a3b8', callback: v => `${v}%` },
          title: { display: true, text: '% sobre Censo / Votantes', color: '#94a3b8', font: { size: 10, weight: 'bold' } }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#cbd5e1', font: { size: 10.5, weight: 'bold' }, padding: 12 }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              return ` ${context.dataset.label}: ${context.raw}%`;
            }
          }
        }
      }
    }
  });
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
          <a href="${b.source_url || 'https://www.iam751.org/'}" target="_blank" class="text-sky-400 underline font-mono text-[9.5px]">[Fuente: ${b.source_name || 'Registro Sindical / Prensa Sectorial'}]</a>
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
        <a href="${c.url || 'https://www.boe.es/diario_boe/txt.php?id=' + (c.boe_id || 'BOE-A-2021-19616')}" target="_blank" class="text-[11px] text-sky-400 underline font-mono block">${c.boe_reference} [Ver en BOE]</a>
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
          <span class="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">${p.actors} <a href="https://t.me/+MnuqJDCAAgYyMGQ0" target="_blank" class="text-sky-400 underline ml-1">[Acta / Asambleas]</a></span>
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
  // 4. Render Point-by-Point Offer Breakdown with Expandable Explanations
  initDetailedOffers();
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

// ==================== THERMOMETER & BELUGA ====================
function initThermometerAndBeluga() {
  const thermo = conflictData?.sentiment_thermometer;
  const beluga = conflictData?.beluga_logistics;

  if (thermo) {
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

  if (beluga) {
    const fleetGrid = document.getElementById('beluga-fleet-grid');
    if (fleetGrid && beluga.all_aircraft) {
      fleetGrid.innerHTML = beluga.all_aircraft.map(ac => {
        const isAirborne = !!ac.airborne;
        const statusText = ac.statusLabel || (isAirborne ? 'En Vuelo' : 'En Tierra');
        const routeText = ac.routeLabel || ac.locationLabel || ac.currentSite || 'Base Toulouse';
        const altText = ac.altitudeFt ? `${ac.altitudeFt.toLocaleString()} ft` : 'En superficie';

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
            <div class="text-[10px] font-mono text-slate-500 flex justify-between border-t border-slate-800/80 pt-1.5">
              <span>Matrícula: <strong class="text-slate-400">${ac.registration || 'N/A'}</strong></span>
              <span>${altText}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    // European Routes Status Grid
    const routesGrid = document.getElementById('beluga-routes-grid');
    const routes = beluga.historical_movements?.european_routes_distribution || [];
    if (routesGrid && routes.length > 0) {
      routesGrid.innerHTML = routes.map(r => `
        <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1 hover:border-slate-700 transition">
          <div class="flex justify-between items-center">
            <span class="text-[11px] font-bold text-white font-mono">${r.route}</span>
            <span class="px-1.5 py-0.5 text-[9px] font-extrabold rounded bg-${r.color || 'blue'}-500/20 text-${r.color || 'blue'}-300 border border-${r.color || 'blue'}-500/30">${r.flights} vuelos</span>
          </div>
          <span class="text-[10px] text-${r.color || 'slate'}-400 font-semibold block">${r.status}</span>
        </div>
      `).join('');
    }
  }
}

function renderThermoFeed(items) {
  const container = document.getElementById('thermo-feed-container');
  if (!container) return;

  container.innerHTML = items.map(item => `
    <div class="p-3.5 bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 rounded-xl transition space-y-1.5">
      <div class="flex justify-between items-center">
        <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${item.impact === 'BAD_FOR_AIRBUS' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}">${item.source} • ${item.date}</span>
        <span class="text-[10px] text-slate-400 font-medium">${item.category}</span>
      </div>
      <a href="${item.url}" target="_blank" class="text-xs font-bold text-white hover:text-sky-400 transition block">
        ${item.title} <i data-lucide="external-link" class="inline w-3 h-3 ml-1 text-slate-500"></i>
      </a>
      <p class="text-xs text-slate-300 mt-1 leading-relaxed">${item.summary}</p>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function filterThermoFeed(category) {
  document.getElementById('btn-feed-all')?.classList.remove('bg-blue-600', 'text-white');
  document.getElementById('btn-feed-bad')?.classList.remove('bg-rose-600', 'text-white');
  document.getElementById('btn-feed-good')?.classList.remove('bg-emerald-600', 'text-white');

  document.getElementById('btn-feed-all')?.classList.add('bg-slate-800', 'text-slate-300');
  document.getElementById('btn-feed-bad')?.classList.add('bg-slate-800', 'text-slate-300');
  document.getElementById('btn-feed-good')?.classList.add('bg-slate-800', 'text-slate-300');

  if (category === 'ALL') {
    document.getElementById('btn-feed-all')?.classList.add('bg-blue-600', 'text-white');
    document.getElementById('btn-feed-all')?.classList.remove('bg-slate-800', 'text-slate-300');
    renderThermoFeed(thermoFeedData);
  } else if (category === 'BAD_FOR_AIRBUS') {
    document.getElementById('btn-feed-bad')?.classList.add('bg-rose-600', 'text-white');
    document.getElementById('btn-feed-bad')?.classList.remove('bg-slate-800', 'text-slate-300');
    renderThermoFeed(thermoFeedData.filter(i => (i.category === 'BAD_FOR_AIRBUS' || i.impact === 'BAD_FOR_AIRBUS' || (i.pressure_impact && String(i.pressure_impact).startsWith('+')))));
  } else if (category === 'GOOD_FOR_AIRBUS') {
    document.getElementById('btn-feed-good')?.classList.add('bg-emerald-600', 'text-white');
    document.getElementById('btn-feed-good')?.classList.remove('bg-slate-800', 'text-slate-300');
    renderThermoFeed(thermoFeedData.filter(i => (i.category === 'GOOD_FOR_AIRBUS' || i.impact === 'GOOD_FOR_AIRBUS' || (i.pressure_impact && String(i.pressure_impact).startsWith('-')))));
  }
}

function initBelugaHistoryChart() {
  const ctx = document.getElementById('belugaHistoryChart')?.getContext('2d');
  if (!ctx) return;

  const history = conflictData?.beluga_logistics?.historical_movements;
  if (!history) return;

  let labels = [];
  let flightsGetafe = [];
  let baselineFlights = [];
  let htpRetained = [];
  let bufferToulouse = [];
  let bufferHamburg = [];

  if (history.weeks && Array.isArray(history.weeks)) {
    labels = history.weeks;
    flightsGetafe = history.getafe_flights_per_week || [];
    baselineFlights = history.normal_baseline_flights || Array(labels.length).fill(14);
    htpRetained = history.accumulated_htp_retained || [];
    bufferToulouse = history.toulouse_fal_stock_buffer_pct || [];
    bufferHamburg = history.hamburg_fal_stock_buffer_pct || [];
  } else if (Array.isArray(history)) {
    labels = history.map(h => h.week || h.name);
    flightsGetafe = history.map(h => h.flights_to_getafe || 0);
    baselineFlights = history.map(h => h.baseline_flights || 14);
    htpRetained = history.map(h => h.htp_units_stockpiled || h.htp_retained || 0);
    bufferToulouse = history.map(h => h.buffer_toulouse || 0);
    bufferHamburg = history.map(h => h.buffer_hamburg || 0);
  }

  if (labels.length === 0) return;

  if (belugaHistoryChart) belugaHistoryChart.destroy();

  belugaHistoryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          type: 'bar',
          label: 'Vuelos Beluga Getafe (Real)',
          data: flightsGetafe,
          backgroundColor: flightsGetafe.map(f => f === 0 ? '#ef4444' : '#3b82f6'),
          borderRadius: 6,
          order: 3,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'Normal Baseline (14 vuelos/sem)',
          data: baselineFlights,
          borderColor: '#64748b',
          borderDash: [5, 5],
          borderWidth: 1.5,
          pointRadius: 0,
          order: 4,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'Estabilizadores HTP Retenidos en Getafe (Unidades)',
          data: htpRetained,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          fill: true,
          yAxisID: 'y1',
          tension: 0.3,
          borderWidth: 2.5,
          order: 1
        },
        {
          type: 'line',
          label: 'Buffer Stock FAL Toulouse (%)',
          data: bufferToulouse,
          borderColor: '#10b981',
          borderWidth: 2,
          borderDash: [3, 3],
          pointRadius: 3,
          yAxisID: 'y2',
          tension: 0.2,
          order: 2
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
          type: 'linear',
          position: 'left',
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: { color: '#94a3b8' },
          title: { display: true, text: 'Vuelos / semana', color: '#94a3b8', font: { size: 10, weight: 'bold' } }
        },
        y1: {
          type: 'linear',
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: '#f59e0b' },
          title: { display: true, text: 'HTP Retenidos (Uds)', color: '#f59e0b', font: { size: 10, weight: 'bold' } }
        },
        y2: {
          type: 'linear',
          position: 'right',
          display: false,
          min: 0,
          max: 100
        },
        x: {
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: { color: '#cbd5e1', font: { size: 10, weight: 'bold' } }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#e2e8f0', font: { size: 11, weight: 'bold' } }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#38bdf8',
          bodyColor: '#f8fafc',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 10
        }
      }
    }
  });
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
          initThermometerAndBeluga();
        }
      }
    } catch (e) {}
  }, 60000);
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

function getFilteredSources() {
  const query = document.getElementById('source-search')?.value.toLowerCase().trim() || '';
  
  return sourcesCatalogData.filter(s => {
    const normCat = normalizeCategory(s.category);
    const matchesCat = (selectedSourceCategory === 'ALL') || (normCat === selectedSourceCategory) || (s.category === selectedSourceCategory);
    
    if (!matchesCat) return false;
    if (!query) return true;

    const title = (s.title || '').toLowerCase();
    const id = (s.id || '').toLowerCase();
    const summary = (s.summary || '').toLowerCase();
    const type = (s.type || '').toLowerCase();
    const url = (s.url || '').toLowerCase();

    return title.includes(query) || id.includes(query) || summary.includes(query) || type.includes(query) || url.includes(query);
  });
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
  const source = sourcesCatalogData.find(s => {
    const cleanId = (s.id || '').replace(/[^a-zA-Z0-9_-]/g, '_');
    return cleanId === sourceId || s.id === sourceId || s.title === sourceId;
  });

  const modalEl = document.getElementById('source-modal');
  const titleEl = document.getElementById('modal-source-title');
  const catEl = document.getElementById('modal-source-category');
  const typeEl = document.getElementById('modal-source-type');
  const sizeEl = document.getElementById('modal-source-size');
  const contentEl = document.getElementById('modal-source-content');
  const linkEl = document.getElementById('modal-source-link');
  const metaEl = document.getElementById('modal-source-footer-meta');

  if (!source) {
    // Check in telegram docs
    const tgDoc = telegramDocsData.find(d => d.id === sourceId || d.title === sourceId);
    if (tgDoc) {
      currentModalSource = tgDoc;
      if (titleEl) titleEl.textContent = tgDoc.title;
      if (catEl) catEl.textContent = tgDoc.category;
      if (typeEl) typeEl.textContent = 'TELEGRAM DOC';
      if (sizeEl) sizeEl.textContent = tgDoc.size_chars ? `${(tgDoc.size_chars/1000).toFixed(1)}k caracteres` : '';
      if (contentEl) contentEl.textContent = tgDoc.summary || 'Documento disponible en el canal EnfadadosconAirbus';
      if (metaEl) metaEl.textContent = `Archivo: ${tgDoc.file_path || tgDoc.id}`;
      if (linkEl) {
        linkEl.href = tgDoc.file_path || '#';
        linkEl.classList.remove('hidden');
      }
      if (modalEl) modalEl.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
      return;
    }
    return;
  }

  currentModalSource = source;

  if (titleEl) titleEl.textContent = source.title;
  if (catEl) catEl.textContent = normalizeCategory(source.category);
  if (typeEl) typeEl.textContent = (source.type || 'DOCUMENTO').toUpperCase();
  if (sizeEl) sizeEl.textContent = source.char_count ? `${source.char_count.toLocaleString()} caracteres` : '';
  if (metaEl) metaEl.textContent = `ID Fuente: ${source.id || 'N/A'}`;

  if (linkEl) {
    if (source.url) {
      linkEl.href = source.url;
      linkEl.classList.remove('hidden');
    } else {
      linkEl.href = source.file_path || `data/sources/${source.id}.txt`;
      linkEl.classList.remove('hidden');
    }
  }

  if (contentEl) {
    contentEl.textContent = "Cargando texto completo...";
    
    // 1. First priority: fulltext_preview if substantial
    if (source.fulltext_preview && source.fulltext_preview.length > 200) {
      contentEl.textContent = source.fulltext_preview;
    }

    // 2. Fetch external text file if served over HTTP
    if (window.location.protocol !== 'file:') {
      try {
        const relPath = source.file_path ? (source.file_path.startsWith('dashboard/') ? source.file_path.replace('dashboard/', '') : `data/${source.file_path}`) : `data/sources/${source.id}.txt`;
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
