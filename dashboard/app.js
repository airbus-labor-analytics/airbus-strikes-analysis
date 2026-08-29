// Airbus Spain 2026 Strike: Strategic Analytics Dashboard Controller

let conflictData = null;
let asymmetryChart = null;
let wagesChart = null;

// Embedded baseline data as immediate fallback
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

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) lucide.createIcons();

  try {
    let res = await fetch('data/conflict_metrics.json');
    if (!res.ok) {
      res = await fetch('../data/conflict_metrics.json');
    }
    if (res.ok) {
      conflictData = await res.json();
    } else {
      conflictData = fallbackData;
    }
  } catch (e) {
    try {
      const res2 = await fetch('../data/conflict_metrics.json');
      conflictData = res2.ok ? await res2.json() : fallbackData;
    } catch (e2) {
      conflictData = fallbackData;
    }
  }

  initChecklist();
  initBenchmarks();
  initSources();
  initAsymmetryChart();
  initWagesChart();
  updateAsymmetrySimulation();
  updateWageSimulation();
  initThermometerAndBeluga();
});

// Tab Switcher
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('bg-blue-600', 'text-white', 'font-semibold');
    btn.classList.add('text-slate-400', 'font-medium');
  });

  const activeTab = document.getElementById(tabId);
  const activeBtn = document.getElementById(`btn-${tabId}`);
  if (activeTab) activeTab.classList.remove('hidden');
  if (activeBtn) {
    activeBtn.classList.remove('text-slate-400', 'font-medium');
    activeBtn.classList.add('bg-blue-600', 'text-white', 'font-semibold');
  }

  if (window.lucide) lucide.createIcons();
}

// Asymmetry Interactive Simulation
function updateAsymmetrySimulation() {
  const days = parseInt(document.getElementById('slider-days').value, 10);
  const salary = parseFloat(document.getElementById('input-salary').value) || 50000;
  document.getElementById('slider-days-val').textContent = `${days} día${days > 1 ? 's' : ''}`;

  const dailyWorkerGross = salary / 365.0;
  const dailyWorkerNet = dailyWorkerGross * 0.72;
  const totalWorkers = conflictData?.parameters?.total_workers_spain || 15562;

  // Airbus Loss curve
  let airbusLoss = 0;
  for (let d = 1; d <= days; d++) {
    if (d <= 3) {
      airbusLoss += 6.5; // M€/day in buffer consumption
    } else if (d <= 5) {
      airbusLoss += 16.5; // FAL throttling
    } else {
      airbusLoss += 22.7; // Full cascade failure + delay penalties
    }
  }

  const workerLossPerPerson = days * dailyWorkerNet;
  const collectivePayrollSaved = (days * dailyWorkerGross * totalWorkers) / 1e6; // in M€
  const ratio = collectivePayrollSaved > 0 ? (airbusLoss / collectivePayrollSaved) : 0;

  document.getElementById('calc-airbus-loss').textContent = `${airbusLoss.toFixed(1)} M€`;
  document.getElementById('calc-worker-loss').textContent = `${Math.round(workerLossPerPerson).toLocaleString()} €`;
  document.getElementById('calc-payroll-saved').textContent = `${collectivePayrollSaved.toFixed(1)} M€`;
  document.getElementById('calc-asymmetry-ratio').textContent = `${ratio.toFixed(1)}x nómina total`;
}

// Wage Calculator
function updateWageSimulation() {
  const salary = parseFloat(document.getElementById('sim-salary').value) || 50000;
  const unionSalary = salary * 1.12;
  const monthlyHike = (salary * 0.12) / 14;
  const companySalary = salary * 1.03;

  document.getElementById('sim-res-union-salary').textContent = `${Math.round(unionSalary).toLocaleString()} €/año`;
  document.getElementById('sim-res-union-monthly').textContent = `+${Math.round(monthlyHike).toLocaleString()} €/mes`;
  document.getElementById('sim-res-company-salary').textContent = `${Math.round(companySalary).toLocaleString()} €/año`;
}

// Asymmetry Chart.js
function initAsymmetryChart() {
  const ctx = document.getElementById('asymmetryChart')?.getContext('2d');
  if (!ctx) return;

  const days = Array.from({ length: 30 }, (_, i) => `Día ${i + 1}`);
  let airbusCum = [];
  let payrollCum = [];
  let cumA = 0;

  for (let d = 1; d <= 30; d++) {
    const dailyA = d <= 3 ? 6.5 : (d <= 5 ? 16.5 : 22.7);
    cumA += dailyA;
    airbusCum.push(cumA);
    payrollCum.push(d * 2.13); // Approx ~2.13 M€/day collective payroll
  }

  asymmetryChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [
        {
          label: 'Pérdida Financiera Airbus SE (M€)',
          data: airbusCum,
          borderColor: '#f43f5e',
          backgroundColor: 'rgba(244, 63, 94, 0.1)',
          fill: true,
          tension: 0.3,
          borderWidth: 2.5
        },
        {
          label: 'Ahorro Nóminas Colectivo Plantilla (M€)',
          data: payrollCum,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.3,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: 'rgba(51, 65, 85, 0.3)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
        y: { grid: { color: 'rgba(51, 65, 85, 0.3)' }, ticks: { color: '#94a3b8', font: { size: 10 }, callback: v => `${v} M€` } }
      },
      plugins: {
        legend: { labels: { color: '#f1f5f9', font: { size: 11, weight: 'bold' } } }
      }
    }
  });
}

// Wages Chart.js
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

// Checklist Initialization
function initChecklist() {
  const container = document.getElementById('checklist-container');
  if (!container) return;

  container.innerHTML = checklistItems.map(item => `
    <label class="flex items-start space-x-3 p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-lg cursor-pointer transition">
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

// Benchmarks Initialization
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

// Sources Initialization
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

// ==================== THERMOMETER & BELUGA LOGISTICS ====================
let thermoFeedData = [];

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
