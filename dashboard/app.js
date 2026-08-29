// Airbus Spain 2026 Strike: Strategic & Financial Analytics Dashboard Controller (v2)

let conflictData = null;
let asymmetryChart = null;
let wagesChart = null;
let belugaHistoryChart = null;
let thermoFeedData = [];
let belugaPollingInterval = null;

// Embedded baseline fallback data
const fallbackData = {
  parameters: {
    total_workers_spain: 15562,
    avg_annual_salary: 50000,
    daily_ebitda_burn_rate_strike: 18500000,
    daily_delay_penalty_cost: 4200000,
    airbus_se_net_profit_2025: 5221000000
  },
  benchmarks: [
    {
      case: "Boeing IAM 751 (2024)",
      badge: "+38% en Tablas",
      badgeColor: "emerald",
      sector: "Aeroespacial Comercial",
      duration: "53 días",
      result: "38% subida en tablas + 12.000$ bono de firma + IPC protegido.",
      lesson: "El rechazo asambleario en dos ocasiones forzó a la dirección a doblar la oferta inicial."
    },
    {
      case: "Spirit AeroSystems (2023)",
      badge: "+20,5% en Tablas",
      badgeColor: "emerald",
      sector: "Aeroestructuras / Fuselajes",
      duration: "7 días",
      result: "20,5% en tablas + Retirada íntegra de recortes de descansos.",
      lesson: "Pausa táctica de 7 días con huelga viva forzó la capitulación patronal al estrangular la cadena de Boeing."
    },
    {
      case: "RMT Network Rail (2022-23)",
      badge: "9% a 14% en Tablas",
      badgeColor: "blue",
      sector: "Infraestructuras Ferroviarias",
      duration: "Paros rotatorios",
      result: "9% a 14,4% consolidado con blindaje contra despidos forzosos.",
      lesson: "La alternancia de paros y negociaciones en SIMA británico evitó la asfixia salarial de las familias."
    },
    {
      case: "Acerinox Palmones (2024)",
      badge: "Asfixia Financiera",
      badgeColor: "rose",
      sector: "Siderurgia",
      duration: "135 días",
      result: "Acuerdo a la baja con desmovilización por asfixia financiera familiar.",
      lesson: "La falta de asimetría crítica en JIT y la ausencia de caja de resistencia agotaron a las bases."
    }
  ],
  sources: [
    { id: "Fuente 1", title: "Dossier de Análisis Estratégico del Conflicto Airbus España (2026)", section: "Monopolio HTP Getafe y seguimiento Beluga (pp. 2-7)" },
    { id: "Fuente 2", title: "Dossier de Recuperación Salarial Airbus España (Convenio VII, v8)", section: "Cálculo de pérdida de poder adquisitivo 20,9%-24,4% (pp. 4-22)" },
    { id: "Fuente 3", title: "Resumen Ejecutivo de Recuperación de Poder Adquisitivo", section: "12% en tablas + 7.500€ atrasos + RSG = IPC + 1,5% (pp. 1-2)" },
    { id: "Fuente 4", title: "Propuesta Conjunta del Comité de Huelga en el SIMA (27/08/2026)", section: "Plataforma formalizada de 11 conceptos económicos y sociales" },
    { id: "Fuente 5", title: "Actas Oficiales de Mediación en el SIMA (25 y 27 de agosto 2026)", section: "Comparecencia de la CHRO y formalización de huelga" },
    { id: "Fuente 6", title: "INE, Banco de España y Banco Central Europeo (2021-2025)", section: "IPC general (+19,3%) e IPC alimentos (+31,2%)" },
    { id: "Fuente 7", title: "Airbus SE Annual Report (Ejercicios 2024 y 2025)", section: "Beneficio neto 5.221 M€ y objetivo de 870 aeronaves (p. 124)" },
    { id: "Fuente 8", title: "Airbus SE Half-Year 2026 Financial Results", section: "Beneficio semestral 2.243 M€ y FCF de 1.950 M€ (pp. 3-6)" },
    { id: "Fuente 9", title: "Convenio Colectivo Interempresas de Airbus (VI Convenio, REGCON)", section: "Artículos 44, 45 y Anexos Salariales" },
    { id: "Fuente 10", title: "Real Decreto-ley 17/1977, sobre Relaciones de Trabajo", section: "Artículos 4, 8.2 y 11 (Suspensión temporal vs Desconvocatoria)" },
    { id: "Fuente 11", title: "Estatuto de los Trabajadores (RD Legislativo 2/2015)", section: "Art. 4.1.e, 28.2, 44, 83.3, 84 y 90" },
    { id: "Fuente 12", title: "Jurisprudencia del Tribunal Constitucional (STC 11/1981)", section: "Doctrina de esquirolaje ilícito tecnológico e interno" },
    { id: "Fuente 13", title: "Reglamento EASA Part-21 (Subpart G)", section: "Requisitos de trazabilidad de firmas y cualificaciones técnicas" }
  ]
};

const checklistItems = [
  { id: "chk_1", title: "1. Consolidación del 12% íntegro en Tablas", desc: "¿El 12% se incorpora al salario base consolidable a 1 de enero de 2026 sin fragmentar en pagas no consolidables?" },
  { id: "chk_2", title: "2. Cláusula de Garantía Salarial Real (RSG)", desc: "¿Se garantiza anualmente RSG = IPC + 1,5% con suelo del 0% y sin topes máximos ni cláusulas de absorción?" },
  { id: "chk_3", title: "3. Pago Único de Atrasos (Mínimo 7.500 €)", desc: "¿Se abona una paga única no consolidable de al menos 7.500 € netos/brutos en concepto de compensación retroactiva?" },
  { id: "chk_4", title: "4. Desistimiento Judicial en IT (Bradford) y Bromo", desc: "¿Airbus retira el recurso de casación ante el Tribunal Supremo y restituye el régimen de IT sin penalizaciones?" },
  { id: "chk_5", title: "5. Blindaje del Contrato de Relevo", desc: "¿Se garantiza la firma obligatoria de prejubilaciones con contratación indefinida al 100% de la jornada?" },
  { id: "chk_6", title: "6. Garantía de Indemnidad y Paz Social Condicionada", desc: "¿La desconvocatoria queda supeditada a la publicación en REGCON/BOE sin represalias por los paros?" }
];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) lucide.createIcons();

  // Load consolidated data
  try {
    let res = await fetch('data/conflict_metrics.json');
    if (!res.ok) res = await fetch('../data/conflict_metrics.json');
    if (res.ok) {
      conflictData = await res.json();
    } else {
      conflictData = fallbackData;
    }
  } catch (e) {
    conflictData = fallbackData;
  }

  // Initialize UI components
  initChecklist();
  initBenchmarks();
  initSources();
  initWorkflows();
  initTimeline();
  initAsymmetryChart();
  initWagesChart();
  initBelugaHistoryChart();
  initThermometerAndBeluga();
  updateAsymmetrySimulation();
  updateWageSimulation();

  // Auto-polling for Beluga Live tracker (every 60s)
  startBelugaLivePolling();
});

// Mobile Sidebar Toggle
function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar-menu');
  if (!sidebar) return;
  sidebar.classList.toggle('-translate-x-full');
}

// Tab Switcher
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('bg-blue-600', 'text-white', 'font-bold');
    btn.classList.add('text-slate-400', 'font-medium');
  });

  const activeTab = document.getElementById(tabId);
  const activeBtn = document.getElementById(`btn-${tabId}`);
  if (activeTab) activeTab.classList.remove('hidden');
  if (activeBtn) {
    activeBtn.classList.remove('text-slate-400', 'font-medium');
    activeBtn.classList.add('bg-blue-600', 'text-white', 'font-bold');
  }

  // Close mobile drawer on item click
  const sidebar = document.getElementById('sidebar-menu');
  if (sidebar && !sidebar.classList.contains('-translate-x-full') && window.innerWidth < 1024) {
    sidebar.classList.add('-translate-x-full');
  }

  if (window.lucide) lucide.createIcons();
}

// ==================== ASYMMETRY SIMULATOR ====================
function updateAsymmetrySimulation() {
  const days = parseInt(document.getElementById('slider-days').value, 10);
  const salary = 50000;
  document.getElementById('slider-days-val').textContent = `${days} día${days > 1 ? 's' : ''}`;

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

  document.getElementById('calc-airbus-loss').textContent = `${airbusLoss.toFixed(1)} M€`;
  document.getElementById('calc-worker-loss').textContent = `${Math.round(workerLossPerPerson).toLocaleString()} €`;
  document.getElementById('calc-payroll-saved').textContent = `${collectivePayrollSaved.toFixed(1)} M€`;
  document.getElementById('calc-asymmetry-ratio').textContent = `${ratio.toFixed(1)}x nómina`;
}

function initAsymmetryChart() {
  const ctx = document.getElementById('asymmetryChart')?.getContext('2d');
  if (!ctx) return;

  const days = [1, 3, 5, 7, 10, 15, 20, 30];
  const airbusLoss = [6.5, 19.5, 52.5, 97.9, 166.0, 279.5, 393.0, 620.0];
  const platformCost = [239, 239, 239, 239, 239, 239, 239, 239];
  const payrollSaved = [2.1, 6.4, 10.7, 14.9, 21.3, 32.0, 42.6, 63.9];

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
        x: { grid: { color: 'rgba(51, 65, 85, 0.3)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
        y: { grid: { color: 'rgba(51, 65, 85, 0.3)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
      },
      plugins: {
        legend: { labels: { color: '#f1f5f9', font: { size: 11, weight: 'bold' } } }
      }
    }
  });
}

// ==================== WAGES SIMULATOR ====================
function updateWageSimulation() {
  const salary = parseFloat(document.getElementById('sim-salary').value) || 50000;
  const unionSalary = salary * 1.12;
  const monthlyHike = (salary * 0.12) / 14;

  document.getElementById('sim-res-union-salary').textContent = `${Math.round(unionSalary).toLocaleString()} €/año`;
  document.getElementById('sim-res-union-monthly').textContent = `+${Math.round(monthlyHike).toLocaleString()} €/mes (14p)`;
}

function initWagesChart() {
  const ctx = document.getElementById('wagesChart')?.getContext('2d');
  if (!ctx) return;

  wagesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['2021', '2022', '2023', '2024', '2025', '2026 (P)', '2027 (P)', '2028 (P)'],
      datasets: [
        {
          label: 'Inflación Acumulada (IPC Real)',
          data: [100, 106.5, 110.2, 114.1, 120.9, 124.5, 127.6, 130.8],
          borderColor: '#ef4444',
          borderDash: [5, 5],
          tension: 0.2,
          borderWidth: 2
        },
        {
          label: 'Plataforma Comité (+12% + IPC+1,5%)',
          data: [100, 101.5, 102.8, 103.5, 104.8, 117.4, 122.1, 126.9],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.2,
          borderWidth: 2.5
        },
        {
          label: 'Oferta Empresa (3% anual)',
          data: [100, 101.5, 102.8, 103.5, 104.8, 107.9, 111.1, 114.4],
          borderColor: '#f59e0b',
          tension: 0.2,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: 'rgba(51, 65, 85, 0.3)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
        y: { grid: { color: 'rgba(51, 65, 85, 0.3)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
      },
      plugins: {
        legend: { labels: { color: '#f1f5f9', font: { size: 11, weight: 'bold' } } }
      }
    }
  });
}

// ==================== BELUGA LIVE TRACKER & HISTORICAL MOVEMENT ====================
function startBelugaLivePolling() {
  if (belugaPollingInterval) clearInterval(belugaPollingInterval);
  belugaPollingInterval = setInterval(() => {
    refreshBelugaLive(false);
  }, 60000);
}

async function refreshBelugaLive(manual = false) {
  try {
    const res = await fetch('https://beluga.simcoe.co.uk/api/belugas.php', { cache: 'no-store' });
    if (res.ok) {
      const liveData = await res.json();
      renderBelugaFleetFromApi(liveData);
      if (manual) showToast("✓ Datos de BelugaWatch actualizados en vivo");
    } else {
      fallbackBelugaRender();
    }
  } catch (e) {
    fallbackBelugaRender();
    if (manual) showToast("✓ Datos de Beluga recargados desde caché local");
  }
}

function renderBelugaFleetFromApi(apiData) {
  const container = document.getElementById('beluga-fleet-grid');
  if (!container) return;

  const aircraftList = apiData.aircraft || [];
  if (aircraftList.length === 0) return;

  container.innerHTML = aircraftList.map(ac => {
    const isAirborne = ac.airborne || false;
    const site = ac.currentSite || "En Tránsito";
    const isSpainRelated = site.toLowerCase().includes('getafe') || (ac.routeFrom && ac.routeFrom.toLowerCase().includes('getafe')) || (ac.routeTo && ac.routeTo.toLowerCase().includes('getafe'));
    const statusColor = isAirborne ? 'emerald' : 'slate';
    const badgeColor = isSpainRelated ? 'rose' : 'blue';

    return `
      <div class="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700 transition">
        <div>
          <div class="flex justify-between items-start">
            <div>
              <span class="text-xs font-bold text-white">${ac.name || 'BelugaXL'}</span>
              <span class="text-[10px] text-slate-400 block font-mono">${ac.registration} • Callsign: ${ac.callsign || 'N/A'}</span>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-${statusColor}-500/20 text-${statusColor}-400 border border-${statusColor}-500/30">
              ${isAirborne ? '● EN VUELO' : 'EN TIERRA'}
            </span>
          </div>

          <div class="mt-3 space-y-1 text-xs">
            <div class="flex justify-between text-slate-300">
              <span class="text-slate-500 text-[11px]">Ubicación:</span>
              <span class="font-medium text-sky-400">${ac.locationLabel || site}</span>
            </div>
            ${ac.speedKt ? `
            <div class="flex justify-between text-slate-400 text-[11px]">
              <span>Velocidad / Altitud:</span>
              <span class="font-mono text-slate-300">${ac.speedKt} kt / ${ac.altitudeFt || 0} ft</span>
            </div>` : ''}
          </div>
        </div>

        <div class="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px]">
          <span class="text-slate-400">Relevancia Huelga:</span>
          <span class="px-1.5 py-0.5 rounded font-bold bg-${badgeColor}-500/20 text-${badgeColor}-300 border border-${badgeColor}-500/30">
            ${isSpainRelated ? '⚠️ Bloqueo HTP Getafe' : 'Ruta Externa'}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

function fallbackBelugaRender() {
  const beluga = conflictData?.beluga_logistics;
  if (beluga) {
    renderBelugaFleet(beluga);
  }
}

function initBelugaHistoryChart() {
  const ctx = document.getElementById('belugaHistoryChart')?.getContext('2d');
  if (!ctx) return;

  const history = conflictData?.beluga_logistics?.historical_movements || {
    weeks: ["Jun (Normal)", "Jul S1", "Jul S2", "Jul S3", "Jul S4", "Ago S1-S3", "Ago S4 (Huelga)"],
    getafe_flights_per_week: [14, 9, 6, 2, 1, 0, 0],
    normal_baseline_flights: [14, 14, 14, 14, 14, 14, 14],
    accumulated_htp_retained: [0, 4, 12, 22, 28, 34, 48]
  };

  belugaHistoryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: history.weeks,
      datasets: [
        {
          type: 'line',
          label: 'Estabilizadores HTP Retenidos en Getafe (Unidades)',
          data: history.accumulated_htp_retained,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          fill: true,
          tension: 0.3,
          borderWidth: 3,
          yAxisID: 'y1'
        },
        {
          type: 'bar',
          label: 'Vuelos BelugaXL Reales Getafe ➔ FALs (Vuelos/Sem)',
          data: history.getafe_flights_per_week,
          backgroundColor: 'rgba(56, 189, 248, 0.8)',
          borderRadius: 6,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'Operativa Normal de Referencia (14 vuelos/sem)',
          data: history.normal_baseline_flights,
          borderColor: '#94a3b8',
          borderDash: [5, 5],
          borderWidth: 1.5,
          pointRadius: 0,
          yAxisID: 'y'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: 'rgba(51, 65, 85, 0.3)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
        y: {
          type: 'linear',
          position: 'left',
          grid: { color: 'rgba(51, 65, 85, 0.3)' },
          ticks: { color: '#38bdf8', font: { size: 10 } },
          title: { display: true, text: 'Vuelos / Semana', color: '#38bdf8', font: { size: 10 } }
        },
        y1: {
          type: 'linear',
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: '#ef4444', font: { size: 10 } },
          title: { display: true, text: 'HTP Retenidos (Uds)', color: '#ef4444', font: { size: 10 } }
        }
      },
      plugins: {
        legend: { labels: { color: '#f1f5f9', font: { size: 11, weight: 'bold' } } }
      }
    }
  });

  // Render Routes Grid
  const routesGrid = document.getElementById('beluga-routes-grid');
  if (routesGrid && history.european_routes_distribution) {
    routesGrid.innerHTML = history.european_routes_distribution.map(r => `
      <div class="p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg text-center">
        <span class="text-[10px] text-slate-400 block font-medium truncate">${r.route}</span>
        <span class="text-xs font-black text-white mt-1 block">${r.flights} vuelos</span>
        <span class="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold rounded bg-${r.color}-500/20 text-${r.color}-400 border border-${r.color}-500/30">${r.status}</span>
      </div>
    `).join('');
  }
}

// ==================== WORKFLOWS & DECISION TREES ====================
function initWorkflows() {
  const container = document.getElementById('workflows-container');
  if (!container) return;

  const workflows = conflictData?.workflows || [];
  if (workflows.length === 0) return;

  container.innerHTML = workflows.map(wf => `
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition space-y-4">
      <div>
        <div class="flex justify-between items-start">
          <span class="px-2 py-0.5 text-[10px] font-extrabold rounded bg-${wf.color}-500/20 text-${wf.color}-400 border border-${wf.color}-500/30">
            ${wf.badge}
          </span>
          <span class="text-[10px] text-slate-500 font-bold uppercase">${wf.category}</span>
        </div>
        <h3 class="text-sm sm:text-base font-black text-white mt-2">${wf.title}</h3>
        <p class="text-xs text-slate-300 mt-1">${wf.objective}</p>

        <div class="mt-4 space-y-2.5">
          ${wf.steps.map(s => `
            <div class="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-start space-x-3">
              <div class="w-5 h-5 rounded-full bg-${wf.color}-600/30 border border-${wf.color}-500/50 flex items-center justify-center text-[10px] font-black text-${wf.color}-300 shrink-0 mt-0.5">
                ${s.step}
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-white">${s.title}</span>
                  <span class="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">${s.gate}</span>
                </div>
                <p class="text-[11px] text-slate-400 mt-1 leading-relaxed whitespace-pre-line">${s.condition}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

// ==================== TIMELINE (2021-2026) ====================
function initTimeline() {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  const timeline = conflictData?.timeline || [];
  if (timeline.length === 0) return;

  container.innerHTML = timeline.map(item => `
    <div class="relative group">
      <!-- Dot on timeline -->
      <div class="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-${item.badge_color}-500 shadow-lg shadow-${item.badge_color}-500/30"></div>

      <div class="bg-slate-900/80 border border-slate-800 group-hover:border-slate-700 p-4 sm:p-5 rounded-2xl transition space-y-3">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-black text-white font-mono bg-slate-800 px-2 py-0.5 rounded">${item.date}</span>
            <span class="text-xs text-slate-400 font-medium">• ${item.phase}</span>
          </div>
          <span class="px-2 py-0.5 text-[10px] font-extrabold rounded bg-${item.badge_color}-500/20 text-${item.badge_color}-400 border border-${item.badge_color}-500/30 self-start sm:self-auto">
            ${item.badge}
          </span>
        </div>

        <h3 class="text-sm sm:text-base font-bold text-white">${item.title}</h3>
        <p class="text-xs text-slate-300 leading-relaxed">${item.summary}</p>

        <div class="flex flex-wrap gap-1.5 pt-1">
          ${item.actors.map(a => `<span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">${a}</span>`).join('')}
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Doc: ${item.source_ref}</span>
        </div>

        <div class="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-[11px] text-slate-300">
          <strong class="text-amber-400">Lección Estratégica:</strong> ${item.strategic_takeaway}
        </div>
      </div>
    </div>
  `).join('');
}

// ==================== THERMOMETER & NEWS FEED ====================
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
    if (badEl) badEl.textContent = `${thermo.bad_for_airbus_percentage}%`;
    if (goodEl) goodEl.textContent = `${thermo.good_for_airbus_percentage}%`;

    thermoFeedData = thermo.feed || [];
    renderThermoFeed(thermoFeedData);
  }

  if (beluga) {
    renderBelugaFleet(beluga);
  }
}

function renderBelugaFleet(beluga) {
  const container = document.getElementById('beluga-fleet-grid');
  if (!container) return;

  const aircraftList = beluga.all_aircraft || beluga.other_airborne_aircraft || [];
  if (aircraftList.length === 0) {
    container.innerHTML = `<div class="col-span-full p-4 text-center text-xs text-slate-400">Datos de flota BelugaXL en proceso de recepción desde OpenSky Network.</div>`;
    return;
  }

  container.innerHTML = aircraftList.map(ac => {
    const isAirborne = ac.airborne || ac.status === "En Vuelo";
    const isSpainRelated = ac.is_spain_connection || (ac.currentSite && ac.currentSite.toLowerCase().includes('getafe'));
    const statusColor = isAirborne ? 'emerald' : 'slate';
    const badgeColor = isSpainRelated ? 'rose' : 'blue';
    const location = ac.locationLabel || ac.currentSite || "En Tránsito";
    const callsign = ac.callsign || "N/A";
    const reg = ac.registration || ac.id || "BXL";

    return `
      <div class="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700 transition">
        <div>
          <div class="flex justify-between items-start">
            <div>
              <span class="text-xs font-bold text-white">${ac.name || 'BelugaXL'}</span>
              <span class="text-[10px] text-slate-400 block font-mono">${reg} • Callsign: ${callsign}</span>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-${statusColor}-500/20 text-${statusColor}-400 border border-${statusColor}-500/30">
              ${isAirborne ? '● EN VUELO' : 'EN TIERRA'}
            </span>
          </div>

          <div class="mt-3 space-y-1 text-xs">
            <div class="flex justify-between text-slate-300">
              <span class="text-slate-500 text-[11px]">Ubicación:</span>
              <span class="font-medium text-sky-400">${location}</span>
            </div>
            ${ac.speedKt ? `
            <div class="flex justify-between text-slate-400 text-[11px]">
              <span>Velocidad / Altitud:</span>
              <span class="font-mono text-slate-300">${ac.speedKt} kt / ${ac.altitudeFt || 0} ft</span>
            </div>` : ''}
          </div>
        </div>

        <div class="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px]">
          <span class="text-slate-400">Relevancia Huelga:</span>
          <span class="px-1.5 py-0.5 rounded font-bold bg-${badgeColor}-500/20 text-${badgeColor}-300 border border-${badgeColor}-500/30">
            ${isSpainRelated ? '⚠️ Bloqueo HTP Getafe' : 'Ruta Externa'}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

function renderThermoFeed(items) {
  const container = document.getElementById('thermo-feed-container');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `<div class="p-4 text-center text-xs text-slate-400">No hay entradas disponibles para este filtro.</div>`;
    return;
  }

  container.innerHTML = items.map(item => {
    const isBadForAirbus = item.category === "BAD_FOR_AIRBUS";
    const badgeClass = isBadForAirbus 
      ? "bg-rose-500/20 text-rose-300 border-rose-500/30" 
      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    const badgeLabel = isBadForAirbus ? "🔴 ALTA PALANCA HUELGA" : "🟢 SPIN CORPORATIVO AIRBUS";
    const impactColor = isBadForAirbus ? "text-rose-400" : "text-emerald-400";

    return `
      <div class="p-4 bg-slate-900/70 border border-slate-800 rounded-xl hover:bg-slate-900 transition">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
          <div class="flex items-center space-x-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              ${item.channel}
            </span>
            <span class="text-xs text-slate-400 font-medium">${item.source} • ${item.date}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold border ${badgeClass}">
              ${badgeLabel}
            </span>
            <span class="text-xs font-black ${impactColor}">${item.pressure_impact}</span>
          </div>
        </div>

        <a href="${item.url}" target="_blank" class="text-xs sm:text-sm font-bold text-white hover:text-blue-400 mt-2 block transition">
          ${item.title} <i data-lucide="external-link" class="inline w-3 h-3 ml-1 text-slate-500"></i>
        </a>
        <p class="text-xs text-slate-300 mt-1.5 leading-relaxed">${item.summary}</p>
      </div>
    `;
  }).join('');

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
    const btn = document.getElementById('btn-feed-all');
    if (btn) { btn.className = "px-2.5 py-1 rounded text-xs font-bold bg-blue-600 text-white"; }
    renderThermoFeed(thermoFeedData);
  } else if (category === 'BAD_FOR_AIRBUS') {
    const btn = document.getElementById('btn-feed-bad');
    if (btn) { btn.className = "px-2.5 py-1 rounded text-xs font-bold bg-rose-600 text-white"; }
    const filtered = thermoFeedData.filter(i => i.category === 'BAD_FOR_AIRBUS');
    renderThermoFeed(filtered);
  } else if (category === 'GOOD_FOR_AIRBUS') {
    const btn = document.getElementById('btn-feed-good');
    if (btn) { btn.className = "px-2.5 py-1 rounded text-xs font-bold bg-emerald-600 text-white"; }
    const filtered = thermoFeedData.filter(i => i.category === 'GOOD_FOR_AIRBUS');
    renderThermoFeed(filtered);
  }
}

// ==================== CHECKLIST ====================
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
  const checked = checklistItems.filter(item => document.getElementById(item.id)?.checked).length;
  document.getElementById('checklist-score').textContent = `${checked} / 6`;

  const verdict = document.getElementById('checklist-verdict');
  if (checked === 6) {
    verdict.textContent = "Oferta Aceptable: Procede Voto SÍ en Urna";
    verdict.className = "block text-[10px] uppercase font-bold text-emerald-400";
  } else if (checked >= 4) {
    verdict.textContent = "Preacuerdo Insuficiente: Exige Mejoras en SIMA";
    verdict.className = "block text-[10px] uppercase font-bold text-amber-400";
  } else {
    verdict.textContent = "Oferta Inaceptable: Votar NO y Reactivar Huelga";
    verdict.className = "block text-[10px] uppercase font-bold text-rose-400";
  }
}

// ==================== BENCHMARKS ====================
function initBenchmarks() {
  const container = document.getElementById('benchmarks-container');
  if (!container) return;

  const data = fallbackData.benchmarks;
  container.innerHTML = data.map(b => `
    <div class="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
      <div>
        <div class="flex justify-between items-start">
          <span class="text-xs font-bold text-white">${b.case}</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-${b.badgeColor}-500/20 text-${b.badgeColor}-300 border border-${b.badgeColor}-500/30">${b.badge}</span>
        </div>
        <p class="text-[11px] text-slate-400 mt-1">${b.sector} • ${b.duration}</p>
        <p class="text-xs text-slate-200 mt-3 font-medium">${b.result}</p>
      </div>
      <div class="mt-4 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
        <span class="text-blue-400 font-semibold">Lección:</span> ${b.lesson}
      </div>
    </div>
  `).join('');
}

// ==================== SOURCES ====================
function initSources() {
  renderSourcesList(fallbackData.sources);
}

function renderSourcesList(sources) {
  const container = document.getElementById('sources-list');
  if (!container) return;

  container.innerHTML = sources.map(s => `
    <div class="p-3 bg-slate-900/70 border border-slate-800 rounded-lg flex items-start justify-between">
      <div>
        <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">${s.id}</span>
        <h4 class="text-xs font-bold text-white mt-1">${s.title}</h4>
        <p class="text-xs text-slate-400 mt-0.5">${s.section}</p>
      </div>
      <i data-lucide="check" class="w-4 h-4 text-emerald-400 shrink-0 ml-2"></i>
    </div>
  `).join('');
  if (window.lucide) lucide.createIcons();
}

function filterSources() {
  const query = document.getElementById('source-search')?.value.toLowerCase() || '';
  const filtered = fallbackData.sources.filter(s => s.title.toLowerCase().includes(query) || s.section.toLowerCase().includes(query) || s.id.toLowerCase().includes(query));
  renderSourcesList(filtered);
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-4 right-4 z-50 bg-slate-900 border border-sky-500/50 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl animate-fade-in';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
