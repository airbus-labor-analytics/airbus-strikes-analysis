// Airbus Spain 2026 Strike: Strategic & Financial Analytics Dashboard Controller (v4)
// High-performance, modular, 100% fail-safe offline & online data binding suite

let conflictData = window.CONFLICT_DATA || null;
let sourcesCatalogData = window.SOURCES_DATA || [];
let telegramDocsData = [];
let asymmetryChart = null;
let wagesChart = null;
let belugaHistoryChart = null;
let thermoFeedData = [];
let belugaPollingInterval = null;
let selectedSourceCategory = 'ALL';
let selectedTgCategory = 'ALL';
let currentModalSource = null;

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

  // 3. Background asynchronous sync for updated datasets when served via HTTP
  syncDataInBackground();

  // 4. Start Beluga Live polling (every 60s)
  startBelugaLivePolling();

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
});

function initAllModules() {
  initChecklist();
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
  initAsymmetryChart();
  initWagesChart();
  initBelugaHistoryChart();
  
  if (window.lucide) lucide.createIcons();
}

async function syncDataInBackground() {
  if (window.location.protocol === 'file:') return;

  try {
    const res = await fetch('data/conflict_metrics.json', { cache: 'no-store' });
    if (res.ok) {
      const liveJson = await res.json();
      if (liveJson && liveJson.parameters) {
        conflictData = liveJson;
        initHistoricalLosses();
        initNegotiationEvolution();
        initTimeline();
        initWorkflows();
        initTelegramArchive();
        initThermometerAndBeluga();
        updateAsymmetrySimulation();
      }
    }
  } catch (e) {
    // Offline or network error - baseline remains active
  }
}

// Tab Switcher
function switchTab(tabId) {
  const normalizedTabId = tabId.startsWith('tab-') ? tabId : `tab-${tabId}`;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('bg-blue-600', 'text-white', 'font-bold');
    btn.classList.add('text-slate-400', 'font-medium');
  });

  const activeTab = document.getElementById(normalizedTabId);
  const activeBtn = document.getElementById(`btn-${normalizedTabId}`);
  if (activeTab) activeTab.classList.remove('hidden');
  if (activeBtn) {
    activeBtn.classList.remove('text-slate-400', 'font-medium');
    activeBtn.classList.add('bg-blue-600', 'text-white', 'font-bold');
  }

  // Update URL hash smoothly
  try {
    if (history.replaceState) {
      history.replaceState(null, null, `#${normalizedTabId}`);
    }
  } catch (e) {}

  // Close mobile drawer on item click
  const sidebar = document.getElementById('sidebar-menu');
  if (sidebar && !sidebar.classList.contains('-translate-x-full') && window.innerWidth < 1024) {
    sidebar.classList.add('-translate-x-full');
  }

  if (window.lucide) lucide.createIcons();
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

// ==================== WAGE SIMULATOR ====================
function updateWageSimulation() {
  const salaryInput = document.getElementById('sim-salary');
  if (!salaryInput) return;
  const curSalary = parseFloat(salaryInput.value) || 50000;

  const newBaseSalary = curSalary * 1.12;
  const monthlyIncrease = (newBaseSalary - curSalary) / 14.0;
  const arrearsPayment = 7500;

  const coBaseSalary = curSalary * 1.05;
  const coMonthlyIncrease = (coBaseSalary - curSalary) / 14.0;
  const coArrears = 2000;

  const resUnionSalary = document.getElementById('sim-res-union-salary');
  const resUnionMonthly = document.getElementById('sim-res-union-monthly');
  const resUnionArrears = document.getElementById('sim-res-union-arrears');
  const resCoSalary = document.getElementById('sim-res-co-salary');
  const resCoMonthly = document.getElementById('sim-res-co-monthly');
  const resCoArrears = document.getElementById('sim-res-co-arrears');

  if (resUnionSalary) resUnionSalary.textContent = `${Math.round(newBaseSalary).toLocaleString()} €/año`;
  if (resUnionMonthly) resUnionMonthly.textContent = `+${Math.round(monthlyIncrease).toLocaleString()} €/mes (14 pagas)`;
  if (resUnionArrears) resUnionArrears.textContent = `+${arrearsPayment.toLocaleString()} €`;

  if (resCoSalary) resCoSalary.textContent = `${Math.round(coBaseSalary).toLocaleString()} €/año`;
  if (resCoMonthly) resCoMonthly.textContent = `+${Math.round(coMonthlyIncrease).toLocaleString()} €/mes (14 pagas)`;
  if (resCoArrears) resCoArrears.textContent = `+${coArrears.toLocaleString()} € (abril 2027)`;

  updateWagesChart(curSalary, newBaseSalary, coBaseSalary);
}

function initWagesChart() {
  const ctx = document.getElementById('wagesChart')?.getContext('2d');
  if (!ctx) return;

  if (wagesChart) wagesChart.destroy();

  wagesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Salario Actual (2025)', 'Oferta Empresa (+5%)', 'Plataforma Comité (+12%)'],
      datasets: [
        {
          label: 'Salario Base Anual Consolidado (€)',
          data: [50000, 52500, 56000],
          backgroundColor: ['#475569', '#f43f5e', '#10b981'],
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: { color: '#94a3b8', callback: v => `${(v/1000).toFixed(0)}k €` }
        },
        x: { ticks: { color: '#e2e8f0', font: { weight: 'bold' } } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function updateWagesChart(cur, union, co) {
  if (!wagesChart) return;
  wagesChart.data.datasets[0].data = [cur, co, union];
  wagesChart.update();
}

// ==================== CHECKLIST ====================
const checklistItems = [
  { id: "chk_1", title: "1. Consolidación del 12% íntegro en Tablas", desc: "¿El 12% se incorpora al salario base consolidable a 1 de enero de 2026 sin fragmentar en pagas no consolidables?" },
  { id: "chk_2", title: "2. Cláusula de Garantía Salarial Real (RSG)", desc: "¿Se garantiza anualmente RSG = IPC + 1,5% con suelo del 0% y sin topes máximos (cap) ni cláusulas de absorción?" },
  { id: "chk_3", title: "3. Pago Único de Atrasos (Mínimo 7.500 €)", desc: "¿Se abona una paga única no consolidable de al menos 7.500 € netos/brutos en concepto de compensación retroactiva?" },
  { id: "chk_4", title: "4. Desistimiento Judicial en IT (Bradford) y Bromo", desc: "¿Airbus retira el recurso de casación ante el Tribunal Supremo y restituye el régimen de IT sin penalizaciones?" },
  { id: "chk_5", title: "5. Blindaje del Contrato de Relevo", desc: "¿Se garantiza la firma obligatoria de prejubilaciones con contratación indefinida al 100% de la jornada?" },
  { id: "chk_6", title: "6. Garantía de Indemnidad y Paz Social Condicionada", desc: "¿La desconvocatoria queda supeditada a la publicación en REGCON/BOE sin represalias por los paros?" }
];

function initChecklist() {
  const container = document.getElementById('checklist-container');
  if (!container) return;

  container.innerHTML = checklistItems.map(item => `
    <label class="flex items-start space-x-3 p-3.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl cursor-pointer transition">
      <input type="checkbox" id="${item.id}" class="mt-1 w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-blue-500" onchange="updateChecklistScore()">
      <div class="flex-1">
        <span class="text-xs font-bold text-white">${item.title}</span>
        <p class="text-xs text-slate-400 mt-0.5">${item.desc}</p>
      </div>
    </label>
  `).join('');
}

function updateChecklistScore() {
  const count = checklistItems.filter(item => document.getElementById(item.id)?.checked).length;
  const scoreEl = document.getElementById('checklist-score');
  const verdictEl = document.getElementById('checklist-verdict');

  if (scoreEl) scoreEl.textContent = `${count} / ${checklistItems.length}`;
  if (verdictEl) {
    if (count === 6) {
      verdictEl.textContent = "Oferta Aceptable para Ratificación (Voto SÍ)";
      verdictEl.className = "text-xs font-bold text-emerald-400";
    } else if (count >= 4) {
      verdictEl.textContent = "Oferta con Brechas Críticas (Exigir Mejoras en SIMA)";
      verdictEl.className = "text-xs font-bold text-amber-400";
    } else {
      verdictEl.textContent = "Oferta Insuficiente (Votar NO en Urna)";
      verdictEl.className = "text-xs font-bold text-rose-400";
    }
  }
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
        <span class="text-[11px] text-sky-400 font-mono block">${c.boe_reference}</span>
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
          <span class="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">${p.actors}</span>
        </div>
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
}

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
    renderThermoFeed(thermoFeedData);
  } else if (category === 'BAD_FOR_AIRBUS') {
    document.getElementById('btn-feed-bad')?.classList.add('bg-rose-600', 'text-white');
    renderThermoFeed(thermoFeedData.filter(i => i.impact === 'BAD_FOR_AIRBUS'));
  } else if (category === 'GOOD_FOR_AIRBUS') {
    document.getElementById('btn-feed-good')?.classList.add('bg-emerald-600', 'text-white');
    renderThermoFeed(thermoFeedData.filter(i => i.impact === 'GOOD_FOR_AIRBUS'));
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
  if (!cat) return 'Noticias & Medios';
  if (cat.includes('Actas') || cat.includes('Legal')) return 'Actas SIMA & Legal';
  if (cat.includes('Dossier') || cat.includes('Salarial')) return 'Dossiers Económicos';
  if (cat.includes('Airbus SE') || cat.includes('Financier')) return 'Informes Airbus SE';
  if (cat.includes('Convenio') || cat.includes('BOE')) return 'Convenios & BOE';
  if (cat.includes('Comunicado') || cat.includes('Huelga')) return 'Comunicados Sindicales';
  if (cat.includes('Cadena') || cat.includes('Logística') || cat.includes('JIT')) return 'Cadena JIT & Logística';
  if (cat.includes('Benchmark') || cat.includes('Internacional')) return 'Benchmark';
  return 'Noticias & Medios';
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
    const matchesCat = (selectedSourceCategory === 'ALL') || (normCat === selectedSourceCategory);
    
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

    return `
      <div class="p-3.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-xl transition flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2 py-0.5 text-[9px] font-extrabold rounded border ${catBadgeColor}">${cat}</span>
            <span class="text-[10px] text-slate-400 font-mono">${s.type ? s.type.toUpperCase() : 'DOC'}</span>
            <span class="text-[10px] text-slate-500 font-mono">${chars}</span>
          </div>
          <h4 class="text-xs font-bold text-white leading-snug">${s.title}</h4>
          ${s.summary ? `<p class="text-[11px] text-slate-400 line-clamp-1 leading-relaxed">${s.summary}</p>` : ''}
        </div>
        <div class="flex items-center space-x-2 shrink-0">
          <button onclick="openSourceModal('${cleanId}')" class="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg text-xs font-bold transition flex items-center">
            <i data-lucide="file-text" class="w-3.5 h-3.5 mr-1 text-blue-400"></i>
            Ver Contenido
          </button>
          ${s.url ? `
            <a href="${s.url}" target="_blank" class="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition" title="Abrir URL original">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
          ` : `
            <a href="${s.file_path || `data/sources/${s.id}.txt`}" download class="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition" title="Descargar texto">
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
    const matchesCat = (selectedTgCategory === 'ALL') || (d.category === selectedTgCategory);
    if (!matchesCat) return false;
    if (!query) return true;

    return (d.title || '').toLowerCase().includes(query) || 
           (d.category || '').toLowerCase().includes(query) || 
           (d.summary || '').toLowerCase().includes(query);
  });
}

function renderTelegramDocs(docs) {
  const container = document.getElementById('telegram-docs-list');
  if (!container) return;

  if (docs.length === 0) {
    container.innerHTML = `<div class="text-center py-8 text-xs text-slate-500">No se encontraron documentos con ese criterio de búsqueda.</div>`;
    return;
  }

  container.innerHTML = docs.map(doc => `
    <div class="p-3.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-xl transition flex flex-col sm:flex-row justify-between sm:items-center gap-3">
      <div class="space-y-1">
        <div class="flex items-center space-x-2">
          <span class="px-2 py-0.5 text-[9px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded">${doc.category}</span>
          <span class="text-xs text-slate-400 font-mono">${doc.date}</span>
          <span class="text-[10px] text-slate-500 font-mono">${(doc.size_chars ? (doc.size_chars/1000).toFixed(1) : 0)}k caracteres</span>
        </div>
        <h5 class="text-xs font-bold text-white">${doc.title}</h5>
        <p class="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">${doc.summary}</p>
      </div>
      <div class="flex items-center space-x-2 shrink-0">
        <button onclick="openSourceModal('${doc.id || doc.title}')" class="px-2.5 py-1.5 bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 rounded-lg text-xs font-bold transition flex items-center">
          <i data-lucide="eye" class="w-3.5 h-3.5 mr-1 text-sky-400"></i>
          Ver Texto
        </button>
        <a href="${doc.file_path}" download class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center">
          <i data-lucide="download" class="w-3.5 h-3.5 mr-1 text-slate-400"></i>
          Descargar
        </a>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}
