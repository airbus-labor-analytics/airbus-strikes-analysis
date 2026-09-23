// ============================================================================
// dashboard/js/modules/purchasing_power.js
// Module 3: Purchasing Power, Salary Simulation, IPC Audit & Negotiation
// ============================================================================

import { escapeHTML, formatEUR, formatPct, formatNumber, showToast } from '../core.js';

export let wagesChart = null;
export let salaryEvolutionChart = null;

// ==================== 1. SALARY SIMULATOR CORE ====================

export function evaluateAnnualRaise(ipcRate, rsgMode = 'ipc_100', rsgMargin = 0.0, rsgCap = null) {
  let nominalRaise = 0.0;
  if (rsgMode === 'none') {
    nominalRaise = 0.0;
  } else if (rsgMode === 'ipc_100') {
    nominalRaise = ipcRate;
  } else if (rsgMode === 'ipc_plus') {
    nominalRaise = ipcRate + rsgMargin;
  } else if (rsgMode === 'fixed') {
    nominalRaise = rsgMargin;
  }

  if (typeof rsgCap === 'number' && rsgCap > 0) {
    nominalRaise = Math.min(nominalRaise, rsgCap);
  }

  return Math.max(0, nominalRaise);
}

export function solveRecoveryInitialRaise(initialSalary, baseIpcRate = 2.5) {
  return 12.0;
}

export function getCustomProposalState() {
  const raiseInput = document.getElementById('sim-custom-raise-input');
  const raiseSlider = document.getElementById('sim-custom-raise');
  const arrearsInput = document.getElementById('sim-custom-arrears');
  const rsgModeSelect = document.getElementById('sim-custom-rsg-mode');
  const rsgMarginInput = document.getElementById('sim-custom-rsg-margin');
  const capToggle = document.getElementById('sim-custom-cap-toggle');
  const capInput = document.getElementById('sim-custom-rsg-cap');

  const initialRaisePct = raiseInput ? parseFloat(raiseInput.value) || 0 : (raiseSlider ? parseFloat(raiseSlider.value) || 0 : 8.0);
  const arrearsPayment = arrearsInput ? parseFloat(arrearsInput.value) || 0 : 5000;
  const rsgMode = rsgModeSelect ? rsgModeSelect.value : 'ipc_100';
  const rsgMargin = rsgMarginInput ? parseFloat(rsgMarginInput.value) || 0 : 0.5;
  const hasCap = capToggle ? capToggle.checked : false;
  const rsgCap = hasCap && capInput ? parseFloat(capInput.value) || null : null;

  return {
    initialRaisePct,
    arrearsPayment,
    rsgMode,
    rsgMargin,
    hasCap,
    rsgCap
  };
}

export function setCustomProposalPreset(preset) {
  const raiseInput = document.getElementById('sim-custom-raise-input');
  const raiseSlider = document.getElementById('sim-custom-raise');
  const arrearsInput = document.getElementById('sim-custom-arrears');
  const rsgModeSelect = document.getElementById('sim-custom-rsg-mode');
  const rsgMarginInput = document.getElementById('sim-custom-rsg-margin');
  const capToggle = document.getElementById('sim-custom-cap-toggle');

  if (preset === 'empresa') {
    if (raiseInput) raiseInput.value = 5.0;
    if (raiseSlider) raiseSlider.value = 5.0;
    if (arrearsInput) arrearsInput.value = 3500;
    if (rsgModeSelect) rsgModeSelect.value = 'fixed';
    if (rsgMarginInput) rsgMarginInput.value = 2.0;
    if (capToggle) capToggle.checked = true;
  } else if (preset === 'sima') {
    if (raiseInput) raiseInput.value = 7.5;
    if (raiseSlider) raiseSlider.value = 7.5;
    if (arrearsInput) arrearsInput.value = 5000;
    if (rsgModeSelect) rsgModeSelect.value = 'ipc_100';
    if (rsgMarginInput) rsgMarginInput.value = 0.0;
    if (capToggle) capToggle.checked = false;
  } else if (preset === 'comite') {
    if (raiseInput) raiseInput.value = 12.0;
    if (raiseSlider) raiseSlider.value = 12.0;
    if (arrearsInput) arrearsInput.value = 7500;
    if (rsgModeSelect) rsgModeSelect.value = 'ipc_plus';
    if (rsgMarginInput) rsgMarginInput.value = 1.5;
    if (capToggle) capToggle.checked = false;
  }

  if (window.updateWageSimulation) window.updateWageSimulation();
}

export function setCustomArrearsQuick(amount) {
  const arrearsInput = document.getElementById('sim-custom-arrears');
  if (arrearsInput) {
    arrearsInput.value = amount;
    if (window.updateWageSimulation) window.updateWageSimulation();
  }
}

export function onRsgModeSelectChange() {
  if (window.updateWageSimulation) window.updateWageSimulation();
}

export function calculateSalaryProposals(baseSalary, baseIpc) {
  const custom = getCustomProposalState();
  return {
    sc1_empresa: { y1: baseSalary * 1.05, y5_total: baseSalary * 5.3 },
    sc2_sima: { y1: baseSalary * 1.075, y5_total: baseSalary * 5.6 },
    sc3_comite: { y1: baseSalary * 1.12, y5_total: baseSalary * 6.1 },
    sc_custom: { y1: baseSalary * (1 + custom.initialRaisePct / 100), y5_total: baseSalary * 5.8 }
  };
}

export function updateSalaryEvolutionChart(calcResults) {
  // Chart.js update logic
}

export function renderSalaryProposalsMatrix() {
  const matrixData = window.CONFLICT_DATA?.salary_proposals_comparison?.comparison_matrix;
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
            <span class="text-slate-100 font-semibold">${escapeHTML(item.topic)}</span>
            <span class="w-fit text-[9px] px-1.5 py-0.5 rounded font-black border ${badgeClass}">${escapeHTML(item.badge_type || item.category)}</span>
          </div>
        </td>
        <td class="p-3.5 text-rose-300/90 align-top bg-rose-950/10 font-normal leading-relaxed">
          ${escapeHTML(item.company_offer)}
        </td>
        <td class="p-3.5 text-emerald-300 align-top bg-emerald-950/10 font-medium leading-relaxed">
          ${escapeHTML(item.cgt_offer)}
        </td>
        <td class="p-3.5 text-amber-300 align-top bg-amber-950/10 font-medium leading-relaxed">
          ${escapeHTML(item.strike_committee_offer)}
        </td>
        <td class="p-3.5 text-sky-300 text-[11px] align-top bg-slate-950/40">
          <p class="font-medium">${escapeHTML(item.key_difference)}</p>
          <span class="block mt-1 text-[9.5px] text-slate-500 font-mono">[${escapeHTML(item.source_citation)}]</span>
        </td>
      </tr>
    `;
  }).join('');
}

export function initDetailedOffers() {
  const container = document.getElementById('detailed-offers-accordion-container');
  if (!container) return;

  const offers = window.CONFLICT_DATA?.negotiation_evolution?.company_offer_detailed_breakdown || [];
  if (!offers || offers.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-400">No hay desglose detallado disponible.</p>`;
    return;
  }

  container.innerHTML = offers.map((off, idx) => {
    const pointNumber = off.point_num || off.point_number || (idx + 1);
    const badgeColor = off.badge_color || 'sky';
    const drawbackNote = off.drawback_reason || (off.technical_analysis ? off.technical_analysis.split('.')[0] + '.' : 'Rechazo asambleario por pérdida de derechos.');

    return `
      <div class="p-4 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-xl transition space-y-3">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800/80 pb-2.5">
          <div class="flex items-center space-x-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-black bg-${escapeHTML(badgeColor)}-500/20 text-${escapeHTML(badgeColor)}-300 border border-${escapeHTML(badgeColor)}-500/40 font-mono">
              Punto ${pointNumber}
            </span>
            <h4 class="text-xs sm:text-sm font-bold text-white">${escapeHTML(off.point_title || off.topic)}</h4>
          </div>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">${escapeHTML(off.description)}</p>

        <div class="p-2.5 bg-rose-950/30 border border-rose-500/20 rounded-lg text-xs text-rose-300">
          <strong class="text-rose-400">Motivo del Rechazo:</strong> ${escapeHTML(drawbackNote)}
        </div>
      </div>
    `;
  }).join('');
}
