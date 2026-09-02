// ============================================================================
// dashboard/js/main.js
// Main Application Orchestrator & Window Exports for HTML Event Handlers
// Airbus Spain 2026 Strike Strategic Analytics Dashboard
// ============================================================================

import * as Core from './core.js';
import * as Overview from './modules/overview.js';
import * as Industrial from './modules/industrial.js';
import * as PurchasingPower from './modules/purchasing_power.js';
import * as UnionForce from './modules/union_force.js';
import * as Timeline from './modules/timeline.js';
import * as Evidence from './modules/evidence.js';
// Global Tab State
export let currentActiveTab = 'tab-portal';

export const tabAliases = {
  'tab-resumen': 'tab-portal',
  'tab-hub': 'tab-portal',
  'tab-asimetria': 'tab-overview',
  'tab-finanzas': 'tab-overview',
  'tab-kpis': 'tab-overview',
  'tab-beluga': 'tab-industrial',
  'tab-logistica': 'tab-industrial',
  'tab-salarios': 'tab-purchasing-power',
  'tab-poder-adquisitivo': 'tab-purchasing-power',
  'tab-sindicatos': 'tab-union-force',
  'tab-asamblea': 'tab-union-force',
  'tab-cronologia': 'tab-timeline',
  'tab-actas': 'tab-timeline',
  'tab-cronograma': 'tab-timeline',
  'tab-fuentes': 'tab-evidence',
  'tab-documentos': 'tab-evidence'
};

export function switchTab(tabId) {
  const resolvedTab = tabAliases[tabId] || tabId;
  currentActiveTab = resolvedTab;

  // 1. Hide all tab contents and show selected
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.add('hidden');
  });

  const activeContent = document.getElementById(resolvedTab);
  if (activeContent) {
    activeContent.classList.remove('hidden');
  }

  // 2. Update Dock Navigation active states
  document.querySelectorAll('.dock-btn').forEach(btn => {
    btn.classList.remove('active', 'bg-blue-600', 'text-white', 'shadow-lg', 'shadow-blue-600/30');
    btn.classList.add('text-slate-400');
  });

  const activeDockBtn = document.getElementById(`dock-${resolvedTab}`);
  if (activeDockBtn) {
    activeDockBtn.classList.add('active', 'bg-blue-600', 'text-white', 'shadow-lg', 'shadow-blue-600/30');
    activeDockBtn.classList.remove('text-slate-400');
  }

  // 3. Update Submodule Navigation
  Core.updateSectionNav(resolvedTab);

  // 4. Scroll to top
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (activeContent) activeContent.scrollTop = 0;

  // 5. Trigger Chart Resizing for visible charts (Principle VI)
  requestAnimationFrame(() => {
    if (window.chartRegistry) {
      Object.values(window.chartRegistry).forEach(chartInstance => {
        if (chartInstance && typeof chartInstance.resize === 'function') {
          chartInstance.resize();
        }
      });
    }
  });

  // 6. Update URL Hash seamlessly
  if (window.location.hash !== `#${resolvedTab}`) {
    history.replaceState(null, '', `#${resolvedTab}`);
  }

  if (window.lucide) lucide.createIcons();
}

export function initApp() {
  // Disable chart animations globally for instant performance
  if (window.Chart) {
    Chart.defaults.animation = false;
    Chart.defaults.responsiveAnimationDuration = 0;
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = 'Geist Mono, JetBrains Mono, monospace';
  }

  // Bind Global Keyboard Shortcuts
  Core.initKeyboardShortcuts();
  Core.initFloatingHUD();

  // Initialize Subsystems
  Overview.initAsymmetrySimulator();
  Overview.initSolvencyAndDividends();
  Industrial.initBelugaLogistics();
  UnionForce.initUnionCensusAndDelegates();
  UnionForce.initReferendumAudit();
  UnionForce.initUnionSections();
  UnionForce.initAssemblyTimeline();
  UnionForce.initWorkflows();
  Evidence.initThermometer();
  Evidence.initSources();
  Evidence.initTelegramArchive();
  Evidence.initBenchmarks();
    // 5. Initialize Module 5: Conflict Timeline & Minutes
    Timeline.initTimeline();


  // Initial Tab Resolution from URL Hash
  const hash = window.location.hash.replace('#', '').split(':')[0];
  const initialTab = hash ? (tabAliases[hash] || hash) : 'tab-portal';
  switchTab(initialTab);

  if (window.lucide) lucide.createIcons();
}

// Bind all functions to window for inline HTML event handlers & test compatibility
window.switchTab = switchTab;
window.scrollToSection = Core.scrollToSection;
window.showToast = Core.showToast;
window.escapeHTML = Core.escapeHTML;
window.sanitizeURL = Core.sanitizeURL;
window.formatEUR = Core.formatEUR;
window.formatPct = Core.formatPct;
window.formatNumber = Core.formatNumber;
window.openGlassModal = Core.openGlassModal;
window.closeGlassModal = Core.closeGlassModal;
window.toggleShortcutsModal = Core.toggleShortcutsModal;
window.closeShortcutsModal = Core.closeShortcutsModal;
window.openSourceModal = Evidence.openSourceModal;
window.closeSourceModal = Core.closeSourceModal;
window.copyModalText = Core.copyModalText;
window.scrollToTop = Core.scrollToTop;

window.setStockTimeRange = Overview.setStockTimeRange;
window.setBelugaTailFilter = Industrial.setBelugaTailFilter;
window.refreshBelugaLive = Industrial.refreshBelugaLive;
window.selectUnionSite = UnionForce.selectUnionSite;
window.filterThermoFeed = Evidence.filterThermoFeed;
window.filterThermoPlatform = Evidence.filterThermoPlatform;
window.filterSourceCategory = Evidence.filterSourceCategory;
window.searchSources = Evidence.searchSources;
window.setTgCategory = Evidence.setTgCategory;
window.searchTelegramDocs = Evidence.searchTelegramDocs;

window.setCustomProposalPreset = PurchasingPower.setCustomProposalPreset;
window.setCustomArrearsQuick = PurchasingPower.setCustomArrearsQuick;
window.onRsgModeSelectChange = PurchasingPower.onRsgModeSelectChange;

window.setTimelineFilter = Timeline.setTimelineFilter;
window.setTimelineActorFilter = Timeline.setTimelineActorFilter;
window.setTimelineSearchQuery = Timeline.setTimelineSearchQuery;
window.renderTimeline = Timeline.renderTimeline;
window.renderTimelineFreshnessBanner = Timeline.renderTimelineFreshnessBanner;
window.evaluateTimelineFreshness = Timeline.evaluateTimelineFreshness;
window.updateHUDTimelineFreshness = Timeline.updateHUDTimelineFreshness;
window.getMadridDate = Timeline.getMadridDate;
// Auto-boot on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
