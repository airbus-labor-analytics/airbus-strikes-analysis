// ============================================================================
// dashboard/js/modules/overview.js
// Module 1: Strategic Asymmetry, Strike Projections & Stock Market Evolution
// ============================================================================

import { escapeHTML, formatEUR, formatNumber, formatPct } from '../core.js';

export let currentStockRange = 'ALL';
export let asymmetryChart = null;
export let airbusStockChart = null;
export let shareholderPieChart = null;

// ==================== 1. ASYMMETRY SIMULATOR ====================

export function initAsymmetrySimulator() {
  const slider = document.getElementById('strikeDaysSlider');
  const input = document.getElementById('strikeDaysInput');
  const initialDays = slider ? parseInt(slider.value, 10) : 10;

  if (slider && input) {
    slider.addEventListener('input', (e) => {
      const days = parseInt(e.target.value, 10);
      input.value = days;
      updateAsymmetrySimulation(days);
    });

    input.addEventListener('input', (e) => {
      let days = parseInt(e.target.value, 10);
      if (isNaN(days)) days = 1;
      if (days < 1) days = 1;
      if (days > 120) days = 120;
      slider.value = days;
      updateAsymmetrySimulation(days);
    });
  }

  updateAsymmetrySimulation(initialDays);
  initAsymmetryChart();
}

export function updateAsymmetrySimulation(strikeDays) {
  const data = window.CONFLICT_DATA;
  if (!data) return;

  const dailyCostM = data.asymmetry_parameters?.daily_cost_airbus_m || 22.7;
  const platformCostM = data.asymmetry_parameters?.worker_platform_cost_m || 118.0;
  const totalCostAirbusM = strikeDays * dailyCostM;

  const totalCostEl = document.getElementById('simTotalCostAirbus');
  const platformRatioEl = document.getElementById('simPlatformRatio');
  const breakEvenEl = document.getElementById('simBreakEvenDays');

  if (totalCostEl) totalCostEl.textContent = `${totalCostAirbusM.toFixed(1).replace('.', ',')} M€`;
  if (platformRatioEl) {
    const ratio = totalCostAirbusM / platformCostM;
    platformRatioEl.textContent = `${ratio.toFixed(2).replace('.', ',')}x`;
  }
  if (breakEvenEl) {
    const beDays = Math.ceil(platformCostM / dailyCostM);
    breakEvenEl.textContent = `${beDays} días`;
  }

  const individualDailySalary = 160.0;
  const individualLoss = strikeDays * individualDailySalary;
  const indivLossEl = document.getElementById('simIndividualLoss');
  if (indivLossEl) {
    indivLossEl.textContent = `-${individualLoss.toFixed(0)} €`;
  }
}

export function initAsymmetryChart() {
  const ctx = document.getElementById('asymmetryChart');
  if (!ctx) return;

  if (asymmetryChart) {
    asymmetryChart.destroy();
  }

  const labels = ['Día 1', 'Día 5', 'Día 10', 'Día 15', 'Día 20', 'Día 30', 'Día 45', 'Día 60'];
  const daysNumeric = [1, 5, 10, 15, 20, 30, 45, 60];
  const dailyCost = window.CONFLICT_DATA?.asymmetry_parameters?.daily_cost_airbus_m || 22.7;
  const platformCost = window.CONFLICT_DATA?.asymmetry_parameters?.worker_platform_cost_m || 118.0;

  const airbusLossData = daysNumeric.map(d => d * dailyCost);
  const platformLine = daysNumeric.map(() => platformCost);

  asymmetryChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Coste Acumulado para Airbus SE (M€)',
          data: airbusLossData,
          borderColor: '#f43f5e',
          backgroundColor: 'rgba(244, 63, 94, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#f43f5e',
          borderWidth: 2.5
        },
        {
          label: 'Coste Plataforma de los Trabajadores (118 M€)',
          data: platformLine,
          borderColor: '#10b981',
          borderDash: [6, 4],
          fill: false,
          pointRadius: 0,
          borderWidth: 2
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
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#cbd5e1',
            font: { family: 'Geist Mono', size: 11 }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.raw.toFixed(1)} M€`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8', font: { family: 'Geist Mono', size: 11 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: {
            color: '#94a3b8',
            font: { family: 'Geist Mono', size: 11 },
            callback: value => `${value} M€`
          }
        }
      }
    }
  });

  window.chartRegistry = window.chartRegistry || {};
  window.chartRegistry['asymmetryChart'] = asymmetryChart;
}

// ==================== 2. AIRBUS STOCK MARKET CHART ====================

export function initAirbusStockChart() {
  const ctx = document.getElementById('airbusStockChart');
  if (!ctx) return;

  if (airbusStockChart) {
    airbusStockChart.destroy();
  }

  const rawStock = window.CONFLICT_DATA?.stock_market?.stock_history_daily || [];
  let stockData = rawStock;

  if (currentStockRange === '1M') {
    stockData = rawStock.filter(d => d.date >= '2026-08-01');
  } else if (currentStockRange === '2W') {
    stockData = rawStock.filter(d => d.date >= '2026-08-15');
  }

  const labels = stockData.map(d => d.date.substring(5));
  const prices = stockData.map(d => d.price);

  airbusStockChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Cotización AIR.PA (€)',
          data: prices,
          borderColor: '#f43f5e',
          backgroundColor: 'rgba(244, 63, 94, 0.08)',
          fill: true,
          tension: 0.25,
          pointRadius: stockData.map(d => d.event ? 5 : 2),
          pointBackgroundColor: stockData.map(d => d.event ? '#f43f5e' : 'rgba(244, 63, 94, 0.4)'),
          pointBorderColor: '#ffffff',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const item = stockData[context.dataIndex];
              const lines = [`Precio: ${context.raw.toFixed(2)} €`];
              if (item && item.event) {
                lines.push(`Hito: ${item.event}`);
              }
              return lines;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8', font: { family: 'Geist Mono', size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: {
            color: '#94a3b8',
            font: { family: 'Geist Mono', size: 11 },
            callback: value => `${value} €`
          }
        }
      }
    }
  });

  window.chartRegistry = window.chartRegistry || {};
  window.chartRegistry['airbusStockChart'] = airbusStockChart;

  renderStockMilestones(rawStock);
}

export function setStockTimeRange(range) {
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

export function renderStockMilestones(stockData) {
  const container = document.getElementById('stock-milestones-container');
  if (!container) return;

  const milestones = stockData.filter(d => d.event);
  const peakPrice = Math.max(...stockData.map(d => d.price));
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
          <p class="text-slate-300 text-[11px] mt-0.5 leading-snug">${escapeHTML(m.event)}</p>
        </div>
        <div class="text-right shrink-0">
          <span class="${dodChange <= 0 ? 'text-rose-400' : 'text-emerald-400'} font-mono font-bold block text-xs">${dodFormatted}</span>
          <span class="text-slate-500 font-mono text-[9.5px] block">pico: ${peakFormatted}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ==================== 3. SOLVENCY & SHAREHOLDER PIE CHART ====================

export function initSolvencyAndDividends() {
  initShareholderPieChart();
}

export function initShareholderPieChart() {
  const ctx = document.getElementById('shareholderPieChart');
  if (!ctx) return;

  if (shareholderPieChart) {
    shareholderPieChart.destroy();
  }

  const data = [
    { label: 'Estado Francés (SOGEPA)', pct: 10.83, color: '#3b82f6' },
    { label: 'Estado Alemán (GZBV)', pct: 10.82, color: '#f59e0b' },
    { label: 'Estado Español (SEPI)', pct: 4.08, color: '#ef4444' },
    { label: 'Autocartera Airbus', pct: 0.10, color: '#64748b' },
    { label: 'Free Float (Inversores Institucionales)', pct: 74.17, color: '#10b981' }
  ];

  shareholderPieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.label),
      datasets: [
        {
          data: data.map(d => d.pct),
          backgroundColor: data.map(d => d.color),
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
          position: 'right',
          labels: {
            color: '#cbd5e1',
            font: { family: 'Geist Mono', size: 10.5 },
            padding: 12
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.raw}%`;
            }
          }
        }
      },
      cutout: '60%'
    }
  });

  window.chartRegistry = window.chartRegistry || {};
  window.chartRegistry['shareholderPieChart'] = shareholderPieChart;
}
