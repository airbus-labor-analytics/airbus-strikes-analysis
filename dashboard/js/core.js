// ============================================================================
// dashboard/js/core.js
// Core Utilities: Security, Formatters, Navigation, Toasts, Modals & Hotkeys
// Airbus Spain 2026 Strike Strategic Analytics Dashboard
// ============================================================================

// ==================== 1. SECURITY & SANITIZATION ====================

/**
 * Strictly escapes HTML entities to neutralize XSS injection payloads.
 * @param {any} str - Input value to escape.
 * @returns {string} Sanitized string safe for HTML interpolation.
 */
export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitizes URLs against dangerous protocols (javascript:, vbscript:, data:).
 * @param {string} url - Target URL.
 * @returns {string} Whitelisted URL or fallback '#'.
 */
export function sanitizeURL(url) {
  if (!url) return '#';
  const clean = String(url).trim();
  if (/^(https?:\/\/|\/|\.\/|#|data\/|docs\/|blob:)/i.test(clean)) {
    return clean;
  }
  return '#';
}

/**
 * Standard debounce wrapper for high-frequency input events.
 */
export function debounce(func, wait = 150) {
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

// ==================== 2. PRECOMPILED INTL FORMATTERS ====================

const EUR_INT_FORMATTER = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0
});

const EUR_DEC_FORMATTER = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const NUM_FORMATTER = new Intl.NumberFormat('es-ES');

/**
 * Formats a numeric value into Euros (es-ES locale).
 * @param {number} value - Amount in EUR.
 * @param {boolean} [withDecimals=false] - Whether to include 2 decimal places.
 * @returns {string} Formatted EUR string.
 */
export function formatEUR(value, withDecimals = false) {
  if (typeof value !== 'number' || isNaN(value)) return '0 €';
  return withDecimals ? EUR_DEC_FORMATTER.format(value) : EUR_INT_FORMATTER.format(value);
}

/**
 * Formats an integer or float using Spanish thousand separators.
 * @param {number} value - Numeric value.
 * @returns {string} Formatted number string.
 */
export function formatNumber(value) {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  return NUM_FORMATTER.format(value);
}

/**
 * Formats a percentage with sign and comma decimal.
 * @param {number} value - Percentage value (e.g. 5.2 or -1.4).
 * @param {number} [decimals=2] - Decimals to display.
 * @returns {string} Formatted percentage string.
 */
export function formatPct(value, decimals = 2) {
  if (typeof value !== 'number' || isNaN(value)) return '0,00%';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals).replace('.', ',')}%`;
}

// ==================== 3. TOAST NOTIFICATION SYSTEM ====================

/**
 * Displays a non-blocking Liquid Crystal floating toast notification.
 * @param {string} message - Message text.
 * @param {string} [iconName='info'] - Lucide icon name.
 * @param {number} [durationMs=2800] - Display duration.
 */
export function showToast(message, iconName = 'info', durationMs = 2800) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto transform transition-all duration-300 translate-y-2 opacity-0 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-white/15 text-white text-xs font-medium shadow-2xl shadow-black/80';
  toast.innerHTML = `
    <i data-lucide="${escapeHTML(iconName)}" class="w-4 h-4 text-sky-400 shrink-0"></i>
    <span class="leading-snug">${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 350);
  }, durationMs);
}

// ==================== 4. NAVIGATION & SUBMODULE NAVIGATION ====================

export const TAB_SECTION_MAP = {
  'tab-overview': {
    title: 'Centro de Mando & Asimetría',
    sections: [
      { id: 'sec-overview-kpis', label: 'KPIs Principales', icon: 'activity' },
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

export function updateSectionNav(tabId) {
  const container = document.getElementById('section-nav-links');
  const titleEl = document.getElementById('section-nav-title');
  if (!container) return;

  const tabConfig = TAB_SECTION_MAP[tabId];
  if (!tabConfig || !tabConfig.sections || tabConfig.sections.length === 0) {
    container.innerHTML = '';
    const sectionNav = document.getElementById('submodule-section-nav');
    if (sectionNav) sectionNav.classList.add('hidden');
    return;
  }

  const sectionNav = document.getElementById('submodule-section-nav');
  if (sectionNav) sectionNav.classList.remove('hidden');
  if (titleEl) titleEl.textContent = tabConfig.title;

  container.innerHTML = tabConfig.sections.map((sec, idx) => `
    <button type="button" onclick="scrollToSection('${escapeHTML(sec.id)}')" id="nav-btn-${escapeHTML(sec.id)}" class="section-nav-item text-left transition-all duration-200 text-[10.5px] py-0.5 -ml-[13px] pl-3 border-l block truncate max-w-[170px] ${idx === 0 ? 'text-sky-400 font-semibold scale-105 origin-left border-sky-400' : 'text-slate-500 hover:text-slate-300 border-transparent hover:border-slate-500'}">
      ${escapeHTML(sec.label)}
    </button>
  `).join('');
}

export function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (!el) return;
  const headerOffset = 90;
  const elementPosition = el.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

  window.scrollTo({
    top: Math.max(0, offsetPosition),
    behavior: 'smooth'
  });

  document.querySelectorAll('.section-nav-item').forEach(btn => {
    btn.classList.remove('text-sky-400', 'font-semibold', 'scale-105', 'origin-left', 'border-sky-400');
    btn.classList.add('text-slate-500', 'border-transparent');
  });

  const activeBtn = document.getElementById(`nav-btn-${sectionId}`);
  if (activeBtn) {
    activeBtn.classList.remove('text-slate-500', 'border-transparent');
    activeBtn.classList.add('text-sky-400', 'font-semibold', 'scale-105', 'origin-left', 'border-sky-400');
  }
}

// ==================== 5. KEYBOARD SHORTCUTS & SEARCH INTEGRATION ====================

export function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // 1. Global Search Shortcut (Ctrl+K, Cmd+K, or Slash)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      focusGlobalSearch();
      return;
    }

    const tag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
    const isInput = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;

    if (isInput) {
      if (e.key === 'Escape') {
        e.target.blur();
        closeAllModals();
      }
      return;
    }

    // Escape closes all open modals
    if (e.key === 'Escape') {
      closeAllModals();
      return;
    }

    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === '0' || e.key === 'p' || e.key === 'P') {
      window.switchTab('tab-portal');
      showToast('Navegación: Portal Hub', 'compass');
    } else if (e.key === '1' || e.key === 'f' || e.key === 'F') {
      window.switchTab('tab-overview');
      showToast('Navegación: Finanzas & Asimetría', 'trending-up');
    } else if (e.key === '2' || e.key === 'b' || e.key === 'B') {
      window.switchTab('tab-industrial');
      showToast('Navegación: Beluga & Logística', 'boxes');
    } else if (e.key === '3' || e.key === 's' || e.key === 'S') {
      window.switchTab('tab-purchasing-power');
      showToast('Navegación: Salarios & Convenio', 'calculator');
    } else if (e.key === '4' || e.key === 'u' || e.key === 'U') {
      window.switchTab('tab-union-force');
      showToast('Navegación: Fuerza Sindical', 'users');
    } else if (e.key === '5' || e.key === 'e' || e.key === 'E') {
      window.switchTab('tab-evidence');
      showToast('Navegación: Evidencias & Archivo', 'book-open');
    } else if (e.key === '/') {
      e.preventDefault();
      focusGlobalSearch();
    } else if (e.key === 't' || e.key === 'T') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (e.key === '?') {
      toggleShortcutsModal();
    }
  });
}

function focusGlobalSearch() {
  const currentTab = document.querySelector('.tab-content:not(.hidden)');
  if (currentTab && currentTab.id === 'tab-evidence') {
    const input = document.getElementById('source-search');
    if (input) {
      input.focus();
      input.select();
    }
  } else {
    window.switchTab('tab-evidence');
    setTimeout(() => {
      const input = document.getElementById('source-search');
      if (input) {
        input.focus();
        input.select();
      }
    }, 120);
  }
}

// ==================== 6. MODAL SYSTEM WITH ACCESSIBILITY ====================

export function toggleShortcutsModal() {
  const modal = document.getElementById('shortcuts-modal');
  if (!modal) return;
  modal.classList.toggle('hidden');
  if (!modal.classList.contains('hidden')) {
    document.body.classList.add('overflow-hidden');
  } else {
    document.body.classList.remove('overflow-hidden');
  }
  if (window.lucide) lucide.createIcons();
}

export function closeShortcutsModal() {
  const modal = document.getElementById('shortcuts-modal');
  if (modal) modal.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

export function openGlassModal(title, contentHtml) {
  const modal = document.getElementById('glass-detail-modal');
  const titleEl = document.getElementById('glass-modal-title');
  const bodyEl = document.getElementById('glass-modal-body');
  if (!modal || !titleEl || !bodyEl) return;

  titleEl.textContent = title;
  bodyEl.innerHTML = contentHtml;
  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  if (window.lucide) lucide.createIcons();
}

export function closeGlassModal() {
  const modal = document.getElementById('glass-detail-modal');
  if (modal) modal.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

export function closeSourceModal() {
  const modalEl = document.getElementById('source-modal');
  if (modalEl) modalEl.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

export function closeAllModals() {
  closeGlassModal();
  closeSourceModal();
  closeShortcutsModal();
  const pointModal = document.getElementById('point-breakdown-modal');
  if (pointModal) pointModal.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

export function copyModalText() {
  const contentEl = document.getElementById('modal-source-content');
  if (!contentEl) return;
  const text = contentEl.textContent || '';
  navigator.clipboard.writeText(text).then(() => {
    showToast("Texto copiado al portapapeles con éxito", "check");
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast("Texto copiado al portapapeles", "check");
  });
}

// ==================== 7. FLOATING HUD & DRAWER ====================

export function initFloatingHUD() {
  const hud = document.getElementById('floating-hud');
  const backToTop = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 300) {
      if (hud) hud.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
      if (backToTop) backToTop.classList.remove('opacity-0', 'pointer-events-none');
    } else {
      if (hud) hud.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
      if (backToTop) backToTop.classList.add('opacity-0', 'pointer-events-none');
    }
  }, { passive: true });
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
