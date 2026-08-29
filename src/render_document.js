const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
// Helper for rendering pill badges
function badge(x, y, w, h, text, bg, border, color, fontSize = 7.5) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="${bg}" stroke="${border}" stroke-width="1"/>
    <text x="${x + w/2}" y="${y + h/2 + 2.5}" font-size="${fontSize}" font-weight="700" fill="${color}" text-anchor="middle">${text}</text>
  `;
}

// 1. Industrial Bottleneck Diagram
function getDiagram1() {
  return `
  <div class="infographic-container">
    <svg viewBox="0 0 900 325" xmlns="http://www.w3.org/2000/svg" class="exec-svg">
      <defs>
        <linearGradient id="g1_hdr" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" /><stop offset="100%" stop-color="#1e3a8a" />
        </linearGradient>
        <linearGradient id="g1_col1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e3a8a" /><stop offset="100%" stop-color="#0284c7" />
        </linearGradient>
        <linearGradient id="g1_col2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#b45309" /><stop offset="100%" stop-color="#f59e0b" />
        </linearGradient>
        <linearGradient id="g1_col3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#991b1b" /><stop offset="100%" stop-color="#ef4444" />
        </linearGradient>
        <filter id="exec_shadow" x="-3%" y="-3%" width="106%" height="110%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.08"/>
        </filter>
        <marker id="exec_arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 8 5 L 0 9 z" fill="#475569" />
        </marker>
      </defs>

      <!-- Outer Frame -->
      <rect x="2" y="2" width="896" height="321" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>

      <!-- Header Banner -->
      <rect x="2" y="2" width="896" height="34" rx="10" fill="url(#g1_hdr)"/>
      <rect x="2" y="24" width="896" height="12" fill="url(#g1_hdr)"/>
      <text x="450" y="21" fill="#ffffff" font-weight="800" font-size="11.5" text-anchor="middle">MAPA INDUSTRIAL: CUELLO DE BOTELLA LOGÍSTICO Y VULNERABILIDAD JUST-IN-TIME (JIT)</text>

      <!-- Col 1: Plantas España -->
      <g transform="translate(18, 46)" filter="url(#exec_shadow)">
        <rect width="265" height="265" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
        <rect width="265" height="30" rx="8" fill="url(#g1_col1)"/>
        <rect y="20" width="265" height="10" fill="url(#g1_col1)"/>
        <text x="132" y="20" fill="#ffffff" font-weight="700" font-size="10.5" text-anchor="middle">1. Factorías Airbus España</text>

        <!-- Subcard 1: Getafe -->
        <g transform="translate(10, 38)">
          <rect width="245" height="66" rx="5" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1"/>
          <text x="8" y="16" font-weight="700" font-size="9.5" fill="#0369a1">Getafe (Monopolio HTP)</text>
          ${badge(150, 6, 88, 14, "100% Producción", "#e0f2fe", "#7dd3fc", "#0369a1", 7)}
          <text x="8" y="32" font-size="8" fill="#334155">• Estabilizador Horizontal (HTP) mundial</text>
          <text x="8" y="45" font-size="8" fill="#334155">• Familias A320, A321XLR, A330, A350</text>
          <text x="8" y="58" font-size="8" fill="#0284c7" font-weight="600">• Sin proveedor alternativo en el mundo</text>
        </g>

        <!-- Subcard 2: Illescas y Puerto Real -->
        <g transform="translate(10, 112)">
          <rect width="245" height="66" rx="5" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1"/>
          <text x="8" y="16" font-weight="700" font-size="9.5" fill="#0369a1">Illescas y Puerto Real (Cádiz)</text>
          ${badge(150, 6, 88, 14, "Fibra de Carbono", "#e0f2fe", "#7dd3fc", "#0369a1", 7)}
          <text x="8" y="32" font-size="8" fill="#334155">• Aeroestructuras en materiales compuestos</text>
          <text x="8" y="45" font-size="8" fill="#334155">• Recubrimientos y vigas de alta precisión</text>
          <text x="8" y="58" font-size="8" fill="#0284c7" font-weight="600">• Piezas exclusivas para Toulouse y Hamburgo</text>
        </g>

        <!-- Subcard 3: Sevilla -->
        <g transform="translate(10, 186)">
          <rect width="245" height="66" rx="5" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1"/>
          <text x="8" y="16" font-weight="700" font-size="9.5" fill="#0369a1">Sevilla (San Pablo y Tablada)</text>
          ${badge(150, 6, 88, 14, "FAL Militar", "#e0f2fe", "#7dd3fc", "#0369a1", 7)}
          <text x="8" y="32" font-size="8" fill="#334155">• Ensayos en vuelo y montaje A400M / C295</text>
          <text x="8" y="45" font-size="8" fill="#334155">• Bloqueo de compromisos de defensa OTAN</text>
          <text x="8" y="58" font-size="8" fill="#0284c7" font-weight="600">• Presión de Gobiernos compradores</text>
        </g>
      </g>

      <!-- Arrow 1 -->
      <path d="M 292 178 L 320 178" stroke="#475569" stroke-width="2.5" marker-end="url(#exec_arr)"/>

      <!-- Col 2: Estrangulamiento JIT -->
      <g transform="translate(328, 46)" filter="url(#exec_shadow)">
        <rect width="244" height="265" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
        <rect width="244" height="30" rx="8" fill="url(#g1_col2)"/>
        <rect y="20" width="244" height="10" fill="url(#g1_col2)"/>
        <text x="122" y="20" fill="#ffffff" font-weight="700" font-size="10.5" text-anchor="middle">2. Estrangulamiento JIT</text>

        <!-- Subcard 1: Beluga -->
        <g transform="translate(10, 38)">
          <rect width="224" height="103" rx="5" fill="#fffbeb" stroke="#fde68a" stroke-width="1"/>
          <text x="8" y="16" font-weight="700" font-size="9.5" fill="#b45309">Flota Beluga Paralizada</text>
          ${badge(130, 6, 86, 14, "Sin Transporte", "#fef3c7", "#fde68a", "#b45309", 7)}
          <text x="8" y="34" font-size="8" fill="#78350f">• Imposibilidad de mover piezas de gran</text>
          <text x="8" y="47" font-size="8" fill="#78350f">  volumen por carretera o barco</text>
          <text x="8" y="63" font-size="8" fill="#78350f">• Los aviones Beluga no pueden cargar</text>
          <text x="8" y="76" font-size="8" fill="#78350f">  componentes sin certificación de taller</text>
          <text x="8" y="92" font-size="8" fill="#b45309" font-weight="700">• Enlace logístico continental cortado</text>
        </g>

        <!-- Subcard 2: Buffer Cero -->
        <g transform="translate(10, 149)">
          <rect width="224" height="103" rx="5" fill="#fffbeb" stroke="#fde68a" stroke-width="1"/>
          <text x="8" y="16" font-weight="700" font-size="9.5" fill="#b45309">Buffers Cero en FALs</text>
          ${badge(130, 6, 86, 14, "Stock 48h-72h", "#fef3c7", "#fde68a", "#b45309", 7)}
          <text x="8" y="34" font-size="8" fill="#78350f">• Filosofía Just-in-Time: no existen</text>
          <text x="8" y="47" font-size="8" fill="#78350f">  almacenes de reserva en Toulouse</text>
          <text x="8" y="63" font-size="8" fill="#78350f">• El stock de HTP se agota en 2-3 días</text>
          <text x="8" y="76" font-size="8" fill="#78350f">• Parada en cascada de líneas finales</text>
          <text x="8" y="92" font-size="8" fill="#b45309" font-weight="700">• Coste millonario por hora detenida</text>
        </g>
      </g>

      <!-- Arrow 2 -->
      <path d="M 580 178 L 608 178" stroke="#475569" stroke-width="2.5" marker-end="url(#exec_arr)"/>

      <!-- Col 3: Impacto Corporativo -->
      <g transform="translate(616, 46)" filter="url(#exec_shadow)">
        <rect width="265" height="265" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
        <rect width="265" height="30" rx="8" fill="url(#g1_col3)"/>
        <rect y="20" width="265" height="10" fill="url(#g1_col3)"/>
        <text x="132" y="20" fill="#ffffff" font-weight="700" font-size="10.5" text-anchor="middle">3. Impacto Corporativo</text>

        <!-- Subcard 1: FALs Paradas -->
        <g transform="translate(10, 38)">
          <rect width="245" height="103" rx="5" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
          <text x="8" y="16" font-weight="700" font-size="9.5" fill="#b91c1c">Parálisis en FALs Europeas</text>
          ${badge(150, 6, 88, 14, "FALs Detenidas", "#fee2e2", "#fecaca", "#b91c1c", 7)}
          <text x="8" y="34" font-size="8" fill="#7f1d1d">• <tspan font-weight="700">Toulouse:</tspan> Montaje A320, A330, A350</text>
          <text x="8" y="47" font-size="8" fill="#7f1d1d">• <tspan font-weight="700">Hamburgo:</tspan> Líneas A321 sin HTP</text>
          <text x="8" y="60" font-size="8" fill="#7f1d1d">• <tspan font-weight="700">Mobile (EE.UU.):</tspan> Sin envíos marítimos</text>
          <text x="8" y="76" font-size="8" fill="#7f1d1d">• Aviones sin terminar ocupando pista</text>
          <text x="8" y="92" font-size="8" fill="#991b1b" font-weight="700">• Bloqueo industrial en toda la UE</text>
        </g>

        <!-- Subcard 2: Quiebra de Metas -->
        <g transform="translate(10, 149)">
          <rect width="245" height="103" rx="5" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
          <text x="8" y="16" font-weight="700" font-size="9.5" fill="#b91c1c">Quiebra Meta de 870 Aviones</text>
          ${badge(150, 6, 88, 14, "Objetivo 2026", "#fee2e2", "#fecaca", "#b91c1c", 7)}
          <text x="8" y="34" font-size="8" fill="#7f1d1d">• Meta corporativa exige 90 entregas/mes</text>
          <text x="8" y="47" font-size="8" fill="#7f1d1d">• Retrasos activan penalizaciones millonarias</text>
          <text x="8" y="60" font-size="8" fill="#7f1d1d">• Desplome del flujo de caja trimestral</text>
          <text x="8" y="76" font-size="8" fill="#7f1d1d">• Presión de la SEPI (4,09%) y Gobierno</text>
          <text x="8" y="92" font-size="8" fill="#991b1b" font-weight="700">• Fuerza a la Dirección a ceder en tablas</text>
        </g>
      </g>
    </svg>
  </div>`;
}

// 2. Negotiation Tactical Pipeline Diagram
// 2. Negotiation Tactical Pipeline Diagram (Redesigned 4-Column Balanced Flow)
function getDiagram2() {
  return `
  <div class="infographic-container">
    <svg viewBox="0 0 920 360" xmlns="http://www.w3.org/2000/svg" class="exec-svg">
      <defs>
        <linearGradient id="d2_hdr" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" /><stop offset="100%" stop-color="#1e3a8a" />
        </linearGradient>
        <linearGradient id="d2_blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e3a8a" /><stop offset="100%" stop-color="#0284c7" />
        </linearGradient>
        <linearGradient id="d2_amber" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#b45309" /><stop offset="100%" stop-color="#f59e0b" />
        </linearGradient>
        <linearGradient id="d2_purple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4338ca" /><stop offset="100%" stop-color="#6366f1" />
        </linearGradient>
        <linearGradient id="d2_red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#991b1b" /><stop offset="100%" stop-color="#dc2626" />
        </linearGradient>
        <linearGradient id="d2_green" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#047857" /><stop offset="100%" stop-color="#10b981" />
        </linearGradient>
        <filter id="d2_shadow" x="-3%" y="-3%" width="106%" height="110%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.08"/>
        </filter>
        <marker id="d2_arr_slate" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 8 5 L 0 9 z" fill="#475569" />
        </marker>
        <marker id="d2_arr_red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 8 5 L 0 9 z" fill="#dc2626" />
        </marker>
        <marker id="d2_arr_green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 8 5 L 0 9 z" fill="#059669" />
        </marker>
      </defs>

      <!-- Outer Frame -->
      <rect x="2" y="2" width="916" height="356" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>

      <!-- Header Banner -->
      <rect x="2" y="2" width="916" height="36" rx="10" fill="url(#d2_hdr)"/>
      <rect x="2" y="26" width="916" height="12" fill="url(#d2_hdr)"/>
      <text x="460" y="23" fill="#ffffff" font-weight="800" font-size="12" text-anchor="middle">ÁRBOL DE DECISIÓN Y SECUENCIA LÓGICA: DE LA HUELGA AL CONVENIO VII</text>

      <!-- ==================== COL 1: ENTRADA SIMA ==================== -->
      <g transform="translate(16, 48)" filter="url(#d2_shadow)">
        <rect width="180" height="295" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
        <rect width="180" height="28" rx="8" fill="url(#d2_blue)"/>
        <rect y="18" width="180" height="10" fill="url(#d2_blue)"/>
        <text x="90" y="19" fill="#ffffff" font-weight="700" font-size="10" text-anchor="middle">1. Entrada en SIMA</text>

        <!-- Mini-card: Estado Inicial -->
        <g transform="translate(8, 36)">
          <rect width="164" height="60" rx="5" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
          <text x="8" y="16" font-weight="700" font-size="8.5" fill="#991b1b">Punto de Partida:</text>
          <text x="8" y="32" font-size="7.8" fill="#7f1d1d">• Huelga Indefinida activa</text>
          <text x="8" y="46" font-size="7.8" fill="#7f1d1d">• Cadena JIT parada en Europa</text>
        </g>

        <!-- Mini-card: Plataforma -->
        <g transform="translate(8, 104)">
          <rect width="164" height="142" rx="5" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1"/>
          <text x="8" y="16" font-weight="700" font-size="8.5" fill="#0369a1">Plataforma 27-Agosto:</text>
          <text x="8" y="32" font-size="7.5" fill="#334155">• <tspan font-weight="700">12% en tablas</tspan> retroactivo 2026</text>
          <text x="8" y="46" font-size="7.5" fill="#334155">• <tspan font-weight="700">RSG = IPC + 1,5%</tspan> sin techo</text>
          <text x="8" y="60" font-size="7.5" fill="#334155">• <tspan font-weight="700">7.500 €</tspan> atrasos de firma</text>
          <text x="8" y="74" font-size="7.5" fill="#334155">• <tspan font-weight="700">40% teletrabajo</tspan> pactado</text>
          <text x="8" y="88" font-size="7.5" fill="#334155">• <tspan font-weight="700">Restitución IT</tspan> (Bradford)</text>
          <text x="8" y="102" font-size="7.5" fill="#334155">• <tspan font-weight="700">Proyecto Bromo</tspan> blindado</text>
          <text x="8" y="116" font-size="7.5" fill="#334155">• <tspan font-weight="700">Prejubilaciones</tspan> con relevo</text>
          <text x="8" y="130" font-size="7.5" fill="#334155">• <tspan font-weight="700">Garantía de indemnidad</tspan></text>
        </g>

        <!-- Footer tag -->
        <rect x="8" y="254" width="164" height="28" rx="4" fill="#f8fafc" stroke="#cbd5e1"/>
        <text x="90" y="272" font-size="7.5" font-weight="700" fill="#0369a1" text-anchor="middle">Comparecencia obligatoria</text>
      </g>

      <!-- Arrow 1 -> 2 -->
      <path d="M 198 195 L 216 195" stroke="#475569" stroke-width="2.5" marker-end="url(#d2_arr_slate)"/>

      <!-- ==================== COL 2: PAUSA TÁCTICA ==================== -->
      <g transform="translate(220, 48)" filter="url(#d2_shadow)">
        <rect width="180" height="295" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
        <rect width="180" height="28" rx="8" fill="url(#d2_amber)"/>
        <rect y="18" width="180" height="10" fill="url(#d2_amber)"/>
        <text x="90" y="19" fill="#ffffff" font-weight="700" font-size="10" text-anchor="middle">2. Pausa Táctica (72h-120h)</text>

        <!-- Mini-card: Propósito -->
        <g transform="translate(8, 36)">
          <rect width="164" height="48" rx="5" fill="#fffbeb" stroke="#fde68a" stroke-width="1"/>
          <text x="8" y="16" font-weight="700" font-size="8.5" fill="#b45309">Instrumento de Presión:</text>
          <text x="8" y="32" font-size="7.5" fill="#78350f">• Test de estrés a la Dirección</text>
          <text x="8" y="44" font-size="7.5" fill="#78350f">• Plazo perentorio en SIMA</text>
        </g>

        <!-- Mini-card: 4 Salvaguardas -->
        <g transform="translate(8, 92)">
          <rect width="164" height="154" rx="5" fill="#ffffff" stroke="#fde68a" stroke-width="1"/>
          <text x="8" y="16" font-weight="700" font-size="8.5" fill="#b45309">4 Salvaguardas Blindadas:</text>

          <text x="8" y="34" font-size="7.8" fill="#0f172a" font-weight="700">1. Huelga 100% activa</text>
          <text x="14" y="46" font-size="7" fill="#64748b">(Sin desconvocatoria legal)</text>

          <text x="8" y="62" font-size="7.8" fill="#0f172a" font-weight="700">2. Actas diarias vinculantes</text>
          <text x="14" y="74" font-size="7" fill="#64748b">(Fuerza de ley: Art. 83.3 ET)</text>

          <text x="8" y="90" font-size="7.8" fill="#0f172a" font-weight="700">3. Veto a salida Beluga</text>
          <text x="14" y="102" font-size="7" fill="#64748b">(Prohibido evacuar stock HTP)</text>

          <text x="8" y="118" font-size="7.8" fill="#0f172a" font-weight="700">4. Desbloqueo prejubilaciones</text>
          <text x="14" y="130" font-size="7" fill="#64748b">(Firma forzosa contratos relevo)</text>
        </g>

        <!-- Plazo tag -->
        <rect x="8" y="254" width="164" height="28" rx="4" fill="#fffbeb" stroke="#fde68a"/>
        <text x="90" y="272" font-size="7.5" font-weight="700" fill="#b45309" text-anchor="middle">Plazo fijado en acta SIMA</text>
      </g>

      <!-- Arrow 2 -> 3 -->
      <path d="M 402 195 L 420 195" stroke="#475569" stroke-width="2.5" marker-end="url(#d2_arr_slate)"/>

      <!-- ==================== COL 3: ENCRUCIJADA / ASAMBLEA ==================== -->
      <g transform="translate(424, 48)" filter="url(#d2_shadow)">
        <rect width="190" height="295" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
        <rect width="190" height="28" rx="8" fill="url(#d2_purple)"/>
        <rect y="18" width="190" height="10" fill="url(#d2_purple)"/>
        <text x="95" y="19" fill="#ffffff" font-weight="700" font-size="10" text-anchor="middle">3. Encrucijada y Urnas</text>

        <!-- Top Section: Test Patronal -->
        <g transform="translate(8, 34)">
          <rect width="174" height="92" rx="5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
          <text x="87" y="15" font-weight="800" font-size="8.5" fill="#312e81" text-anchor="middle">Test de Estrés en SIMA</text>
          <text x="87" y="28" font-size="7.3" fill="#475569" text-anchor="middle">¿Airbus firma el 12% en tablas?</text>

          <!-- Option NO -->
          <rect x="8" y="36" width="158" height="22" rx="4" fill="#fee2e2" stroke="#fca5a5"/>
          <text x="14" y="51" font-size="7.5" font-weight="700" fill="#991b1b">NO / Dilata ➔</text>
          <text x="78" y="51" font-size="7" fill="#7f1d1d">Ruptura del plazo</text>

          <!-- Option YES -->
          <rect x="8" y="62" width="158" height="22" rx="4" fill="#ecfdf5" stroke="#a7f3d0"/>
          <text x="14" y="77" font-size="7.5" font-weight="700" fill="#065f46">SÍ / Redacta ➔</text>
          <text x="80" y="77" font-size="7" fill="#065f46">Pasa a Preacuerdo</text>
        </g>

        <!-- Internal Arrow from YES to Urna -->
        <path d="M 103 126 L 103 138" stroke="#059669" stroke-width="2" marker-end="url(#d2_arr_green)"/>

        <!-- Bottom Section: Votación en Urna -->
        <g transform="translate(8, 142)">
          <rect width="174" height="142" rx="5" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1"/>
          <text x="87" y="16" font-weight="800" font-size="8.5" fill="#0369a1" text-anchor="middle">Votación en Urna (Bases)</text>
          <text x="8" y="32" font-size="7.5" fill="#334155">• Voto secreto e individual</text>
          <text x="8" y="45" font-size="7.5" fill="#334155">• Ratificación en asambleas</text>
          <text x="8" y="58" font-size="7.5" fill="#334155">• Verificación de los 6 filtros</text>

          <line x1="8" y1="68" x2="166" y2="68" stroke="#bae6fd" stroke-width="1"/>

          <!-- Voto Rechaza -->
          <rect x="8" y="74" width="158" height="26" rx="4" fill="#fee2e2" stroke="#fca5a5"/>
          <text x="14" y="90" font-size="7.5" font-weight="700" fill="#991b1b">Voto NO ➔</text>
          <text x="68" y="90" font-size="7" fill="#7f1d1d">Rechazo de oferta</text>

          <!-- Voto Aprueba -->
          <rect x="8" y="106" width="158" height="26" rx="4" fill="#ecfdf5" stroke="#a7f3d0"/>
          <text x="14" y="122" font-size="7.5" font-weight="700" fill="#065f46">Voto SÍ ➔</text>
          <text x="68" y="122" font-size="7" fill="#065f46">Aprobación mayoría</text>
        </g>
      </g>

      <!-- Connector Lines from Col 3 to Terminal Col 4 -->
      <!-- Line 1: Dilata (SIMA NO) -> Red Box -->
      <path d="M 598 93 L 642 93 L 642 100 L 662 100" stroke="#dc2626" stroke-width="2.5" fill="none" marker-end="url(#d2_arr_red)"/>

      <!-- Line 2: Voto NO (Urna) -> Red Box -->
      <path d="M 598 230 L 634 230 L 634 135 L 662 135" stroke="#dc2626" stroke-width="2.5" fill="none" marker-end="url(#d2_arr_red)"/>

      <!-- Line 3: Voto SÍ (Urna) -> Green Box -->
      <path d="M 598 268 L 662 268" stroke="#059669" stroke-width="2.5" fill="none" marker-end="url(#d2_arr_green)"/>

      <!-- ==================== COL 4: DESENLACES TERMINALES ==================== -->

      <!-- TERMINAL A: HUELGA TOTAL (Red Card) -->
      <g transform="translate(668, 48)" filter="url(#d2_shadow)">
        <rect width="236" height="135" rx="8" fill="#fef2f2" stroke="#fecaca" stroke-width="1.5"/>
        <rect width="236" height="28" rx="8" fill="url(#d2_red)"/>
        <rect y="18" width="236" height="10" fill="url(#d2_red)"/>
        <text x="118" y="19" fill="#ffffff" font-weight="700" font-size="9.5" text-anchor="middle">DESENLACE A: HUELGA TOTAL</text>

        <g transform="translate(10, 36)">
          <text x="0" y="13" font-size="8" font-weight="700" fill="#991b1b">Activación Inmediata:</text>
          <text x="0" y="27" font-size="7.5" fill="#7f1d1d">• Si la empresa dilata en el SIMA o las</text>
          <text x="0" y="39" font-size="7.5" fill="#7f1d1d">  bases rechazan el texto en urna.</text>
          <text x="0" y="55" font-size="7.5" fill="#7f1d1d">• <tspan font-weight="700">Sin nuevos preavisos</tspan> (Art. 8.2 RD 17/1977).</text>
          <text x="0" y="69" font-size="7.5" fill="#7f1d1d">• Bloqueo total de HTP en Getafe.</text>
          <text x="0" y="85" font-size="7.5" fill="#991b1b" font-weight="700">• Paralización continental irreversible.</text>
        </g>
      </g>

      <!-- TERMINAL B: CONVENIO VII FIRMADO (Green Card) -->
      <g transform="translate(668, 198)" filter="url(#d2_shadow)">
        <rect width="236" height="145" rx="8" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1.5"/>
        <rect width="236" height="28" rx="8" fill="url(#d2_green)"/>
        <rect y="18" width="236" height="10" fill="url(#d2_green)"/>
        <text x="118" y="19" fill="#ffffff" font-weight="700" font-size="9.5" text-anchor="middle">DESENLACE B: CONVENIO VII FIRMADO</text>

        <g transform="translate(10, 36)">
          <text x="0" y="13" font-size="8" font-weight="700" fill="#166534">Victoria Sindical Vinculante:</text>
          <text x="0" y="27" font-size="7.5" fill="#15803d">• Firma oficial tras aprobación en urna.</text>
          <text x="0" y="41" font-size="7.5" fill="#15803d">• <tspan font-weight="700">12% consolidado en tablas</tspan> retroactivo.</text>
          <text x="0" y="55" font-size="7.5" fill="#15803d">• <tspan font-weight="700">IPC real garantizado</tspan> sin techos.</text>
          <text x="0" y="69" font-size="7.5" fill="#15803d">• Registro oficial en REGCON y BOE.</text>
          <text x="0" y="85" font-size="7.5" fill="#047857" font-weight="700">• Paz social con blindaje de plantilla.</text>
        </g>
      </g>
    </svg>
  </div>`;
}

// 3. Assembly Debate Dialectic Matrix (YES vs NO)
function getDiagram3() {
  return `
  <div class="infographic-container">
    <svg viewBox="0 0 900 360" xmlns="http://www.w3.org/2000/svg" class="exec-svg">
      <defs>
        <linearGradient id="g3_hdr" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" /><stop offset="100%" stop-color="#1e3a8a" />
        </linearGradient>
        <linearGradient id="g3_yes" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#065f46" /><stop offset="100%" stop-color="#059669" />
        </linearGradient>
        <linearGradient id="g3_no" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#991b1b" /><stop offset="100%" stop-color="#dc2626" />
        </linearGradient>
      </defs>

      <!-- Frame -->
      <rect x="2" y="2" width="896" height="356" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>

      <!-- Header -->
      <rect x="2" y="2" width="896" height="34" rx="10" fill="url(#g3_hdr)"/>
      <rect x="2" y="24" width="896" height="12" fill="url(#g3_hdr)"/>
      <text x="450" y="21" fill="#ffffff" font-weight="800" font-size="11.5" text-anchor="middle">MATRIZ DIALÉCTICA ASAMBLEARIA: ¿POR QUÉ SÍ VS. POR QUÉ NO A LA PAUSA TÁCTICA DE 72-120h?</text>

      <!-- Columna SÍ (Ventajas) -->
      <g transform="translate(18, 46)" filter="url(#exec_shadow)">
        <rect width="422" height="240" rx="8" fill="#ffffff" stroke="#a7f3d0" stroke-width="1.5"/>
        <rect width="422" height="28" rx="8" fill="url(#g3_yes)"/>
        <rect y="18" width="422" height="10" fill="url(#g3_yes)"/>
        <text x="211" y="19" fill="#ffffff" font-weight="700" font-size="10.5" text-anchor="middle">OPCIÓN SÍ: 4 VENTAJAS TÁCTICAS CLAVE</text>

        <g transform="translate(10, 36)">
          <!-- Item 1 -->
          <rect width="402" height="46" rx="4" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
          ${badge(8, 6, 68, 14, "Ventaja 1", "#dcfce7", "#86efac", "#166534", 7)}
          <text x="82" y="17" font-weight="700" font-size="8.8" fill="#166534">Desarma el victimismo patronal ante Gobierno y SEPI</text>
          <text x="8" y="32" font-size="7.8" fill="#334155">Traslada la carga de la prueba a Airbus: si en 72h no pone el 12% en el SIMA, queda en evidencia</text>
          <text x="8" y="42" font-size="7.8" fill="#334155">su mala fe negociadora ante el Ministerio de Industria y la opinión pública.</text>

          <!-- Item 2 -->
          <g transform="translate(0, 52)">
            <rect width="402" height="46" rx="4" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
            ${badge(8, 6, 68, 14, "Ventaja 2", "#dcfce7", "#86efac", "#166534", 7)}
            <text x="82" y="17" font-weight="700" font-size="8.8" fill="#166534">Actas vinculantes sesión a sesión en el SIMA</text>
            <text x="8" y="32" font-size="7.8" fill="#334155">Cada jornada negociadora queda sellada formalmente (Art. 83.3 ET). Si la empresa dilata o</text>
            <text x="8" y="42" font-size="7.8" fill="#334155">no avanza, los paros se reanudan al siguiente turno sin necesidad de nuevos preavisos.</text>
          </g>

          <!-- Item 3 -->
          <g transform="translate(0, 104)">
            <rect width="402" height="46" rx="4" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
            ${badge(8, 6, 68, 14, "Ventaja 3", "#dcfce7", "#86efac", "#166534", 7)}
            <text x="82" y="17" font-weight="700" font-size="8.8" fill="#166534">Oxigenación salarial de las familias trabajadoras</text>
            <text x="8" y="32" font-size="7.8" fill="#334155">Permite percibir nómina 3-4 días sin que Airbus pueda reponer su stock (el buffer de HTP en</text>
            <text x="8" y="42" font-size="7.8" fill="#334155">Getafe requiere semanas para normalizarse), evitando el ahogo financiero de Acerinox 2024.</text>
          </g>

          <!-- Item 4 -->
          <g transform="translate(0, 156)">
            <rect width="402" height="46" rx="4" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
            ${badge(8, 6, 68, 14, "Ventaja 4", "#dcfce7", "#86efac", "#166534", 7)}
            <text x="82" y="17" font-weight="700" font-size="8.8" fill="#166534">Test de estrés resolutivo (Ultimátum a la Dirección)</text>
            <text x="8" y="32" font-size="7.8" fill="#334155">Funciona como ultimátum con plazo perentorio improrrogable que fuerza a la multinacional</text>
            <text x="8" y="42" font-size="7.8" fill="#334155">a redactar el texto definitivo de convenio bajo mediación formal intensiva.</text>
          </g>
        </g>
      </g>

      <!-- Columna NO (Riesgos) -->
      <g transform="translate(460, 46)" filter="url(#exec_shadow)">
        <rect width="422" height="240" rx="8" fill="#ffffff" stroke="#fecaca" stroke-width="1.5"/>
        <rect width="422" height="28" rx="8" fill="url(#g3_no)"/>
        <rect y="18" width="422" height="10" fill="url(#g3_no)"/>
        <text x="211" y="19" fill="#ffffff" font-weight="700" font-size="10.5" text-anchor="middle">OPCIÓN NO: 4 RIESGOS QUE EXIGEN BLINDAJE</text>

        <g transform="translate(10, 36)">
          <!-- Item 1 -->
          <rect width="402" height="46" rx="4" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
          ${badge(8, 6, 68, 14, "Riesgo 1", "#fee2e2", "#fca5a5", "#991b1b", 7)}
          <text x="82" y="17" font-weight="700" font-size="8.8" fill="#991b1b">Peligro de desmovilización psicológica y asamblearia</text>
          <text x="8" y="32" font-size="7.8" fill="#334155">Suspender el paro puede relajar la tensión en las factorías y dificultar la reorganización</text>
          <text x="8" y="42" font-size="7.8" fill="#334155">de piquetes informativos si la empresa rompe la negociación.</text>

          <!-- Item 2 -->
          <g transform="translate(0, 52)">
            <rect width="402" height="46" rx="4" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
            ${badge(8, 6, 68, 14, "Riesgo 2", "#fee2e2", "#fca5a5", "#991b1b", 7)}
            <text x="82" y="17" font-weight="700" font-size="8.8" fill="#991b1b">Riesgo de evacuación de piezas terminadas en Beluga</text>
            <text x="8" y="32" font-size="7.8" fill="#334155">Airbus podría intentar aprovechar los días de actividad para sacar estabilizadores (HTP)</text>
            <text x="8" y="42" font-size="7.8" fill="#334155">terminados hacia Toulouse y reponer sus líneas europeas de montaje.</text>
          </g>

          <!-- Item 3 -->
          <g transform="translate(0, 104)">
            <rect width="402" height="46" rx="4" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
            ${badge(8, 6, 68, 14, "Riesgo 3", "#fee2e2", "#fca5a5", "#991b1b", 7)}
            <text x="82" y="17" font-weight="700" font-size="8.8" fill="#991b1b">Maniobra dilatoria patronal para ganar tiempo</text>
            <text x="8" y="32" font-size="7.8" fill="#334155">La dirección puede emplear la pausa para marear con debates técnicos y metodológicos</text>
            <text x="8" y="42" font-size="7.8" fill="#334155">sin poner sobre la mesa la subida en tablas del 12% exigida por las bases.</text>
          </g>

          <!-- Item 4 -->
          <g transform="translate(0, 156)">
            <rect width="402" height="46" rx="4" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
            ${badge(8, 6, 68, 14, "Riesgo 4", "#fee2e2", "#fca5a5", "#991b1b", 7)}
            <text x="82" y="17" font-weight="700" font-size="8.8" fill="#991b1b">Percepción de debilidad o cesión ante el chantaje</text>
            <text x="8" y="32" font-size="7.8" fill="#334155">La dirección de Recursos Humanos podría interpretar la pausa como un síntoma de</text>
            <text x="8" y="42" font-size="7.8" fill="#334155">agotamiento y endurecer su postura negociadora en lugar de ceder.</text>
          </g>
        </g>
      </g>

      <!-- Bottom Card: Síntesis y 4 Líneas Rojas -->
      <g transform="translate(18, 294)">
        <rect width="864" height="58" rx="6" fill="#0f172a"/>
        <text x="432" y="16" font-weight="800" font-size="9.5" fill="#f8fafc" text-anchor="middle">SÍNTESIS VINCULANTE: LAS 4 LÍNEAS ROJAS INNEGOCIABLES PARA AUTORIZAR LA PAUSA</text>
        <g transform="translate(15, 24)">
          ${badge(0, 0, 195, 24, "1. Huelga 100% Viva y Registrada", "#1e293b", "#38bdf8", "#38bdf8", 7.5)}
          ${badge(210, 0, 195, 24, "2. Plazo Límite Improrrogable (SIMA)", "#1e293b", "#38bdf8", "#38bdf8", 7.5)}
          ${badge(420, 0, 205, 24, "3. Veto a Evacuación en Beluga", "#1e293b", "#38bdf8", "#38bdf8", 7.5)}
          ${badge(640, 0, 195, 24, "4. Ratificación en Urna por Bases", "#1e293b", "#38bdf8", "#38bdf8", 7.5)}
        </g>
      </g>
    </svg>
  </div>`;
}

// 4. Strike Cases Scorecard Diagram
function getDiagram4() {
  return `
  <div class="infographic-container">
    <svg viewBox="0 0 900 360" xmlns="http://www.w3.org/2000/svg" class="exec-svg">
      <defs>
        <linearGradient id="g4_hdr" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" /><stop offset="100%" stop-color="#1e3a8a" />
        </linearGradient>
        <linearGradient id="g4_win" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#065f46" /><stop offset="100%" stop-color="#10b981" />
        </linearGradient>
        <linearGradient id="g4_fail" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#991b1b" /><stop offset="100%" stop-color="#ef4444" />
        </linearGradient>
      </defs>

      <!-- Frame -->
      <rect x="2" y="2" width="896" height="356" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>

      <!-- Header -->
      <rect x="2" y="2" width="896" height="34" rx="10" fill="url(#g4_hdr)"/>
      <rect x="2" y="24" width="896" height="12" fill="url(#g4_hdr)"/>
      <text x="450" y="21" fill="#ffffff" font-weight="800" font-size="11.5" text-anchor="middle">BENCHMARK DE CONFLICTOS LABORALES: CASOS REALES DE ÉXITO VS. FRACASO</text>

      <!-- Left Box: ÉXITOS -->
      <g transform="translate(18, 46)" filter="url(#exec_shadow)">
        <rect width="422" height="300" rx="8" fill="#ffffff" stroke="#a7f3d0" stroke-width="1.5"/>
        <rect width="422" height="26" rx="8" fill="url(#g4_win)"/>
        <rect y="16" width="422" height="10" fill="url(#g4_win)"/>
        <text x="211" y="18" fill="#ffffff" font-weight="700" font-size="10" text-anchor="middle">4 MODELOS DE ÉXITO (PALANCA INDUSTRIAL Y FIRMEZA)</text>

        <g transform="translate(10, 32)">
          <!-- Item 1: Spirit -->
          <rect width="402" height="60" rx="4" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
          <text x="8" y="14" font-weight="700" font-size="8.8" fill="#166534">Spirit AeroSystems (IAM 839, 2023) - Aeroespacial</text>
          ${badge(290, 4, 104, 14, "+20,5% en Tablas", "#dcfce7", "#86efac", "#166534", 7)}
          <text x="8" y="28" font-size="7.6" fill="#334155"><tspan font-weight="700">Táctica:</tspan> Paro total fulminante de 4 días tras rechazo asambleario del 79%.</text>
          <text x="8" y="41" font-size="7.6" fill="#334155"><tspan font-weight="700">Resultado:</tspan> Mediación federal forzó capitulación patronal en 72h sin desgastar nóminas.</text>
          <text x="8" y="54" font-size="7.6" fill="#15803d" font-weight="600"><tspan font-weight="700">Lección:</tspan> El bloqueo en cuellos de botella Just-in-Time colapsa a la matriz de inmediato.</text>

          <!-- Item 2: RMT -->
          <g transform="translate(0, 66)">
            <rect width="402" height="60" rx="4" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
            <text x="8" y="14" font-weight="700" font-size="8.8" fill="#166534">RMT Network Rail (2022–2023) - Ferrocarril UK</text>
            ${badge(290, 4, 104, 14, "9% a 14% en Tablas", "#dcfce7", "#86efac", "#166534", 7)}
            <text x="8" y="28" font-size="7.6" fill="#334155"><tspan font-weight="700">Táctica:</tspan> Paros intermitentes de 48h alternados con semanas de negociación técnica formal.</text>
            <text x="8" y="41" font-size="7.6" fill="#334155"><tspan font-weight="700">Resultado:</tspan> La plantilla cobró nómina casi completa mientras el Gobierno cedía en tablas.</text>
            <text x="8" y="54" font-size="7.6" fill="#15803d" font-weight="600"><tspan font-weight="700">Lección:</tspan> Pausas tácticas oxigenan a las familias sin retirar jamás la convocatoria activa.</text>
          </g>

          <!-- Item 3: Metal Cádiz -->
          <g transform="translate(0, 132)">
            <rect width="402" height="60" rx="4" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
            <text x="8" y="14" font-weight="700" font-size="8.8" fill="#166534">Metal de Cádiz (2021) - Industria del Metal</text>
            ${badge(290, 4, 104, 14, "2% Anual + IPC", "#dcfce7", "#86efac", "#166534", 7)}
            <text x="8" y="28" font-size="7.6" fill="#334155"><tspan font-weight="700">Táctica:</tspan> Huelga indefinida de 9 días con bloqueo total de accesos y factorías tractoras.</text>
            <text x="8" y="41" font-size="7.6" fill="#334155"><tspan font-weight="700">Resultado:</tspan> FEMCA cedió ante mediación en el CARL garantizando la consolidación de IPC.</text>
            <text x="8" y="54" font-size="7.6" fill="#15803d" font-weight="600"><tspan font-weight="700">Lección:</tspan> Unidad sindical absoluta y piquetes unitarios impiden preacuerdos a la baja.</text>
          </g>

          <!-- Item 4: Boeing -->
          <g transform="translate(0, 198)">
            <rect width="402" height="60" rx="4" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
            <text x="8" y="14" font-weight="700" font-size="8.8" fill="#166534">Boeing (IAM 751, 2024) - Aeroespacial Seattle</text>
            ${badge(290, 4, 104, 14, "+38% en Tablas", "#dcfce7", "#86efac", "#166534", 7)}
            <text x="8" y="28" font-size="7.6" fill="#334155"><tspan font-weight="700">Táctica:</tspan> Huelga continua de 53 días con rechazo en urnas del 25% y 35% previo.</text>
            <text x="8" y="41" font-size="7.6" fill="#334155"><tspan font-weight="700">Resultado:</tspan> 38% de incremento (43,6% compuesto) y 12.000 $ de bonus de firma.</text>
            <text x="8" y="54" font-size="7.6" fill="#15803d" font-weight="600"><tspan font-weight="700">Lección:</tspan> La soberanía asamblearia con voto secreto es la mejor defensa de la plantilla.</text>
          </g>
        </g>
      </g>

      <!-- Right Box: FRACASOS -->
      <g transform="translate(460, 46)" filter="url(#exec_shadow)">
        <rect width="422" height="300" rx="8" fill="#ffffff" stroke="#fecaca" stroke-width="1.5"/>
        <rect width="422" height="26" rx="8" fill="url(#g4_fail)"/>
        <rect y="16" width="422" height="10" fill="url(#g4_fail)"/>
        <text x="211" y="18" fill="#ffffff" font-weight="700" font-size="10" text-anchor="middle">3 MODELOS DE FRACASO (TRAMPAS Y DESGASTE)</text>

        <g transform="translate(10, 32)">
          <!-- Item 1: SNCF -->
          <rect width="402" height="80" rx="4" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
          <text x="8" y="14" font-weight="700" font-size="8.8" fill="#991b1b">SNCF Grève Perlée (2018) - Ferrocarril Francia</text>
          ${badge(290, 4, 104, 14, "Fracaso Estratégico", "#fee2e2", "#fca5a5", "#991b1b", 7)}
          <text x="8" y="28" font-size="7.6" fill="#334155"><tspan font-weight="700">Error Estratégico:</tspan> Calendario fijo y predecible ("2 días de huelga cada 5") durante 3 meses.</text>
          <text x="8" y="42" font-size="7.6" fill="#334155"><tspan font-weight="700">Consecuencia:</tspan> La empresa reorganizó turnos en días activos y suministros sin colapsar.</text>
          <text x="8" y="56" font-size="7.6" fill="#334155"><tspan font-weight="700">Resultado:</tspan> Desgaste de 36 días de nómina descontados sin doblar a la dirección.</text>
          <text x="8" y="70" font-size="7.6" fill="#b91c1c" font-weight="600"><tspan font-weight="700">Lección:</tspan> Nunca usar calendarios predecibles que permitan a la empresa adaptarse.</text>

          <!-- Item 2: Acerinox -->
          <g transform="translate(0, 88)">
            <rect width="402" height="84" rx="4" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
            <text x="8" y="14" font-weight="700" font-size="8.8" fill="#991b1b">Acerinox Palmones (2024) - Siderurgia Cádiz</text>
            ${badge(290, 4, 104, 14, "Asfixia Financiera", "#fee2e2", "#fca5a5", "#991b1b", 7)}
            <text x="8" y="28" font-size="7.6" fill="#334155"><tspan font-weight="700">Error Estratégico:</tspan> Huelga lineal continua de 135 días sin pausas técnicas ni caja.</text>
            <text x="8" y="42" font-size="7.6" fill="#334155"><tspan font-weight="700">Consecuencia:</tspan> Asfixia económica familiar tras 4 meses sin nómina generó desesperación.</text>
            <text x="8" y="56" font-size="7.6" fill="#334155"><tspan font-weight="700">Resultado:</tspan> Fractura sindical interna, pérdida de subida en tablas y despido de 225 trabajadores.</text>
            <text x="8" y="72" font-size="7.6" fill="#b91c1c" font-weight="600"><tspan font-weight="700">Lección:</tspan> El paro lineal indefinido sin modulación destruye la economía de las bases.</text>
          </g>

          <!-- Item 3: Iberia Handling -->
          <g transform="translate(0, 180)">
            <rect width="402" height="80" rx="4" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
            <text x="8" y="14" font-weight="700" font-size="8.8" fill="#991b1b">Iberia Handling (2023–2024) - Servicios Aeroportuarios</text>
            ${badge(290, 4, 104, 14, "Paro Neutralizado", "#fee2e2", "#fca5a5", "#991b1b", 7)}
            <text x="8" y="28" font-size="7.6" fill="#334155"><tspan font-weight="700">Error Estratégico:</tspan> Convocatoria en fechas clave con servicios mínimos del 90% impuestos.</text>
            <text x="8" y="42" font-size="7.6" fill="#334155"><tspan font-weight="700">Consecuencia:</tspan> La operativa funcionó con normalidad bajo servicios mínimos abusivos.</text>
            <text x="8" y="56" font-size="7.6" fill="#334155"><tspan font-weight="700">Resultado:</tspan> Pérdida de nómina de los huelguistas sin causar daño económico a la patronal.</text>
            <text x="8" y="70" font-size="7.6" fill="#b91c1c" font-weight="600"><tspan font-weight="700">Lección:</tspan> Una huelga solo triunfa si ejerce daño real sobre el cuello de botella productivo.</text>
          </g>
        </g>
      </g>
    </svg>
  </div>`;
}

// 5. Threat Dismantling Matrix Diagram
function getDiagram5_Threats() {
  return `
  <div class="infographic-container">
    <svg viewBox="0 0 900 325" xmlns="http://www.w3.org/2000/svg" class="exec-svg">
      <defs>
        <linearGradient id="g5_hdr" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" /><stop offset="100%" stop-color="#1e3a8a" />
        </linearGradient>
        <linearGradient id="g5_t" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#991b1b" /><stop offset="100%" stop-color="#dc2626" />
        </linearGradient>
        <linearGradient id="g5_r" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e3a8a" /><stop offset="100%" stop-color="#0284c7" />
        </linearGradient>
        <linearGradient id="g5_a" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#065f46" /><stop offset="100%" stop-color="#059669" />
        </linearGradient>
      </defs>

      <!-- Frame -->
      <rect x="2" y="2" width="896" height="321" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>

      <!-- Header -->
      <rect x="2" y="2" width="896" height="34" rx="10" fill="url(#g5_hdr)"/>
      <rect x="2" y="24" width="896" height="12" fill="url(#g5_hdr)"/>
      <text x="450" y="21" fill="#ffffff" font-weight="800" font-size="11.5" text-anchor="middle">DESMONTAJE DE AMENAZAS PATRONALES: FUNDAMENTOS TÉCNICO-JURÍDICOS Y CONTRAMEDIDAS</text>

      <!-- 3 Columns (Threat 1, Threat 2, Threat 3) -->

      <!-- Card 1: Deslocalización -->
      <g transform="translate(18, 46)" filter="url(#exec_shadow)">
        <rect width="270" height="265" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
        <rect width="270" height="32" rx="8" fill="url(#g5_t)"/>
        <rect y="22" width="270" height="10" fill="url(#g5_t)"/>
        <text x="135" y="21" fill="#ffffff" font-weight="700" font-size="9.5" text-anchor="middle">1. Amenaza de Deslocalización</text>

        <!-- Red Quote -->
        <g transform="translate(10, 40)">
          <rect width="250" height="34" rx="4" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
          <text x="8" y="14" font-size="7.5" font-weight="700" fill="#991b1b">Discurso de Recursos Humanos:</text>
          <text x="8" y="26" font-size="7.2" fill="#7f1d1d">"Desviaremos los HTP a Hamburgo o Toulouse"</text>
        </g>

        <!-- Blue Technical/Legal Reality -->
        <g transform="translate(10, 80)">
          <rect width="250" height="105" rx="4" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1"/>
          <text x="8" y="14" font-weight="700" font-size="8.5" fill="#0369a1">Realidad Técnica y Jurídica:</text>
          <text x="8" y="28" font-size="7.5" fill="#334155">• <tspan font-weight="700">Certificación EASA Part-21:</tspan> Homologar</text>
          <text x="14" y="40" font-size="7.2" fill="#334155">una nueva línea exige entre 12 y 24 meses.</text>
          <text x="8" y="54" font-size="7.5" fill="#334155">• <tspan font-weight="700">Esquirolaje ilícito transnacional:</tspan> Desviar</text>
          <text x="14" y="66" font-size="7.2" fill="#334155">piezas en huelga vulnera la STC 11/1981.</text>
          <text x="8" y="80" font-size="7.5" fill="#334155">• <tspan font-weight="700">Sin utillaje duplicado:</tspan> Getafe tiene el</text>
          <text x="14" y="92" font-size="7.2" fill="#334155">100% de moldes para A350 y A321XLR.</text>
        </g>

        <!-- Green Action -->
        <g transform="translate(10, 192)">
          <rect width="250" height="64" rx="4" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1"/>
          <text x="8" y="14" font-weight="700" font-size="8.5" fill="#047857">Contramedida Sindical en SIMA:</text>
          <text x="8" y="28" font-size="7.5" fill="#065f46">• Mantener el bloqueo en plantas.</text>
          <text x="8" y="42" font-size="7.5" fill="#065f46">• Blindar cláusula de carga de trabajo</text>
          <text x="8" y="54" font-size="7.5" fill="#065f46">  y monopolio de HTP en el Convenio VII.</text>
        </g>
      </g>

      <!-- Card 2: Salidas y Prejubilaciones -->
      <g transform="translate(315, 46)" filter="url(#exec_shadow)">
        <rect width="270" height="265" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
        <rect width="270" height="32" rx="8" fill="url(#g5_t)"/>
        <rect y="22" width="270" height="10" fill="url(#g5_t)"/>
        <text x="135" y="21" fill="#ffffff" font-weight="700" font-size="9.5" text-anchor="middle">2. Amenaza a Prejubilaciones</text>

        <!-- Red Quote -->
        <g transform="translate(10, 40)">
          <rect width="250" height="34" rx="4" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
          <text x="8" y="14" font-size="7.5" font-weight="700" fill="#991b1b">Discurso de Recursos Humanos:</text>
          <text x="8" y="26" font-size="7.2" fill="#7f1d1d">"Paralizaremos jubilaciones parciales con relevo"</text>
        </g>

        <!-- Blue Technical/Legal Reality -->
        <g transform="translate(10, 80)">
          <rect width="250" height="105" rx="4" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1"/>
          <text x="8" y="14" font-weight="700" font-size="8.5" fill="#0369a1">Realidad Técnica y Jurídica:</text>
          <text x="8" y="28" font-size="7.5" fill="#334155">• <tspan font-weight="700">Coacción flagrante:</tspan> Vulneración directa</text>
          <text x="14" y="40" font-size="7.2" fill="#334155">del derecho de huelga (Art. 28.2 CE).</text>
          <text x="8" y="54" font-size="7.5" fill="#334155">• <tspan font-weight="700">Necesidad imperiosa de relevo:</tspan> Airbus</text>
          <text x="14" y="66" font-size="7.2" fill="#334155">requiere contratar jóvenes para el ramp-up.</text>
          <text x="8" y="80" font-size="7.5" fill="#334155">• <tspan font-weight="700">Obligación contractual:</tspan> Regulado en</text>
          <text x="14" y="92" font-size="7.2" fill="#334155">el Art. 12.6 ET y la LGSS (Art. 215).</text>
        </g>

        <!-- Green Action -->
        <g transform="translate(10, 192)">
          <rect width="250" height="64" rx="4" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1"/>
          <text x="8" y="14" font-weight="700" font-size="8.5" fill="#047857">Contramedida Sindical en SIMA:</text>
          <text x="8" y="28" font-size="7.5" fill="#065f46">• Denuncia ante Inspección de Trabajo.</text>
          <text x="8" y="42" font-size="7.5" fill="#065f46">• Exigir firma y desbloqueo inmediato</text>
          <text x="8" y="54" font-size="7.5" fill="#065f46">  de los expedientes como condición previa.</text>
        </g>
      </g>

      <!-- Card 3: Ultimátum No Negociamos -->
      <g transform="translate(612, 46)" filter="url(#exec_shadow)">
        <rect width="270" height="265" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
        <rect width="270" height="32" rx="8" fill="url(#g5_t)"/>
        <rect y="22" width="270" height="10" fill="url(#g5_t)"/>
        <text x="135" y="21" fill="#ffffff" font-weight="700" font-size="9.5" text-anchor="middle">3. Ultimátum "No Negociamos"</text>

        <!-- Red Quote -->
        <g transform="translate(10, 40)">
          <rect width="250" height="34" rx="4" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
          <text x="8" y="14" font-size="7.5" font-weight="700" fill="#991b1b">Discurso de Recursos Humanos:</text>
          <text x="8" y="26" font-size="7.2" fill="#7f1d1d">"Desconvocad la huelga o no habrá propuesta"</text>
        </g>

        <!-- Blue Technical/Legal Reality -->
        <g transform="translate(10, 80)">
          <rect width="250" height="105" rx="4" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1"/>
          <text x="8" y="14" font-weight="700" font-size="8.5" fill="#0369a1">Realidad Técnica y Jurídica:</text>
          <text x="8" y="28" font-size="7.5" fill="#334155">• <tspan font-weight="700">Coartada de debilidad:</tspan> Buscan recuperar</text>
          <text x="14" y="40" font-size="7.2" fill="#334155">stock para desactivar la presión sindical.</text>
          <text x="8" y="54" font-size="7.5" fill="#334155">• <tspan font-weight="700">Asimetría del daño:</tspan> Cada día de paro</text>
          <text x="14" y="66" font-size="7.2" fill="#334155">cuesta millones en penalizaciones a Airbus.</text>
          <text x="8" y="80" font-size="7.5" fill="#334155">• <tspan font-weight="700">Obligación legal:</tspan> El SIMA obliga a</text>
          <text x="14" y="92" font-size="7.2" fill="#334155">negociar de buena fe bajo mediación.</text>
        </g>

        <!-- Green Action -->
        <g transform="translate(10, 192)">
          <rect width="250" height="64" rx="4" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1"/>
          <text x="8" y="14" font-weight="700" font-size="8.5" fill="#047857">Contramedida Sindical en SIMA:</text>
          <text x="8" y="28" font-size="7.5" fill="#065f46">• Ofrecer pausa táctica (72h-120h)</text>
          <text x="8" y="42" font-size="7.5" fill="#065f46">  con huelga viva y actas diarias.</text>
          <text x="8" y="54" font-size="7.5" fill="#065f46">• Ultimátum para plasmar tablas en SIMA.</text>
        </g>
      </g>
    </svg>
  </div>`;
}

// 6. Executive Probabilities and Scenarios
function getDiagram6_Probabilities() {
  return `
  <div class="infographic-container">
    <svg viewBox="0 0 900 330" xmlns="http://www.w3.org/2000/svg" class="exec-svg">
      <defs>
        <linearGradient id="g6_hdr" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" /><stop offset="100%" stop-color="#1e3a8a" />
        </linearGradient>
        <linearGradient id="g6_s1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#047857" /><stop offset="100%" stop-color="#10b981" />
        </linearGradient>
        <linearGradient id="g6_s2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0369a1" /><stop offset="100%" stop-color="#38bdf8" />
        </linearGradient>
        <linearGradient id="g6_s3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#b45309" /><stop offset="100%" stop-color="#fbbf24" />
        </linearGradient>
        <linearGradient id="g6_s4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#991b1b" /><stop offset="100%" stop-color="#f87171" />
        </linearGradient>
      </defs>

      <!-- Frame -->
      <rect x="2" y="2" width="896" height="326" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>

      <!-- Header -->
      <rect x="2" y="2" width="896" height="34" rx="10" fill="url(#g6_hdr)"/>
      <rect x="2" y="24" width="896" height="12" fill="url(#g6_hdr)"/>
      <text x="450" y="21" fill="#ffffff" font-weight="800" font-size="11.5" text-anchor="middle">MODELO PROBABILÍSTICO DE ESCENARIOS DE RESOLUCIÓN (HUELGA AIRBUS ESPAÑA 2026)</text>

      <!-- 4 Stacked Scenarios -->

      <!-- Scenario 1: Victoria Sindical Plena (58%) -->
      <g transform="translate(18, 46)" filter="url(#exec_shadow)">
        <rect width="864" height="62" rx="6" fill="#ffffff" stroke="#a7f3d0" stroke-width="1.5"/>
        <rect x="12" y="10" width="180" height="42" rx="4" fill="#ecfdf5" stroke="#a7f3d0"/>
        <text x="22" y="26" font-weight="800" font-size="9.5" fill="#065f46">1. Victoria Plena</text>
        <text x="22" y="42" font-size="8" fill="#047857">Mediación Política Favorable</text>

        <!-- Progress Gauge -->
        <rect x="202" y="18" width="280" height="26" rx="13" fill="#f1f5f9"/>
        <rect x="202" y="18" width="162" height="26" rx="13" fill="url(#g6_s1)"/>
        <text x="283" y="35" font-weight="800" font-size="10" fill="#ffffff" text-anchor="middle">58% Probabilidad</text>

        <!-- Result Box -->
        <rect x="495" y="8" width="357" height="46" rx="4" fill="#f0fdf4" stroke="#bbf7d0"/>
        <text x="505" y="22" font-weight="700" font-size="8.5" fill="#166534">Resultado Proyectado:</text>
        <text x="505" y="34" font-size="7.8" fill="#334155">• <tspan font-weight="700">Tablas 10%–12%</tspan> retroactivo 2026 + <tspan font-weight="700">RSG = IPC + 1% a 1,5% sin techo</tspan></text>
        <text x="505" y="46" font-size="7.8" fill="#334155">• Atrasos <tspan font-weight="700">5.000 € a 7.500 €</tspan> + 40% Teletrabajo + IT Bradford restituida</text>
      </g>

      <!-- Scenario 2: Pacto Transaccional Mixto (27%) -->
      <g transform="translate(18, 114)" filter="url(#exec_shadow)">
        <rect width="864" height="62" rx="6" fill="#ffffff" stroke="#bae6fd" stroke-width="1.5"/>
        <rect x="12" y="10" width="180" height="42" rx="4" fill="#f0f9ff" stroke="#bae6fd"/>
        <text x="22" y="26" font-weight="800" font-size="9.5" fill="#0369a1">2. Pacto Mixto</text>
        <text x="22" y="42" font-size="8" fill="#0284c7">Transacción y Desgaste</text>

        <!-- Progress Gauge -->
        <rect x="202" y="18" width="280" height="26" rx="13" fill="#f1f5f9"/>
        <rect x="202" y="18" width="76" height="26" rx="13" fill="url(#g6_s2)"/>
        <text x="240" y="35" font-weight="800" font-size="9.5" fill="#ffffff" text-anchor="middle">27%</text>

        <!-- Result Box -->
        <rect x="495" y="8" width="357" height="46" rx="4" fill="#f0f9ff" stroke="#bae6fd"/>
        <text x="505" y="22" font-weight="700" font-size="8.5" fill="#0369a1">Resultado Proyectado:</text>
        <text x="505" y="34" font-size="7.8" fill="#334155">• <tspan font-weight="700">Tablas 7,5% a 9%</tspan> + Cláusula ligada a IPC con salvaguarda</text>
        <text x="505" y="46" font-size="7.8" fill="#334155">• Paga única no consolidable de <tspan font-weight="700">3.500 € a 5.000 €</tspan> + Teletrabajo regulado</text>
      </g>

      <!-- Scenario 3: Bloqueo y Arbitraje / Mediación (11%) -->
      <g transform="translate(18, 182)" filter="url(#exec_shadow)">
        <rect width="864" height="62" rx="6" fill="#ffffff" stroke="#fde68a" stroke-width="1.5"/>
        <rect x="12" y="10" width="180" height="42" rx="4" fill="#fffbeb" stroke="#fde68a"/>
        <text x="22" y="26" font-weight="800" font-size="9.5" fill="#b45309">3. Arbitraje / Mediación</text>
        <text x="22" y="42" font-size="8" fill="#78350f">Intervención de Fomento/SEPI</text>

        <!-- Progress Gauge -->
        <rect x="202" y="18" width="280" height="26" rx="13" fill="#f1f5f9"/>
        <rect x="202" y="18" width="31" height="26" rx="13" fill="url(#g6_s3)"/>
        <text x="218" y="35" font-weight="800" font-size="9" fill="#ffffff" text-anchor="middle">11%</text>

        <!-- Result Box -->
        <rect x="495" y="8" width="357" height="46" rx="4" fill="#fffbeb" stroke="#fde68a"/>
        <text x="505" y="22" font-weight="700" font-size="8.5" fill="#b45309">Resultado Proyectado:</text>
        <text x="505" y="34" font-size="7.8" fill="#334155">• <tspan font-weight="700">Laudo o propuesta mediadora obligatoria</tspan> intermedia (8% a 9%)</text>
        <text x="505" y="46" font-size="7.8" fill="#334155">• Eliminación de techos abusivos de IPC + Dictamen vinculante SIMA</text>
      </g>

      <!-- Scenario 4: Fractura Asamblearia / Imposición (4%) -->
      <g transform="translate(18, 250)" filter="url(#exec_shadow)">
        <rect width="864" height="62" rx="6" fill="#ffffff" stroke="#fecaca" stroke-width="1.5"/>
        <rect x="12" y="10" width="180" height="42" rx="4" fill="#fef2f2" stroke="#fecaca"/>
        <text x="22" y="26" font-weight="800" font-size="9.5" fill="#991b1b">4. Fractura / Imposición</text>
        <text x="22" y="42" font-size="8" fill="#7f1d1d">Pérdida de Unidad Sindical</text>

        <!-- Progress Gauge -->
        <rect x="202" y="18" width="280" height="26" rx="13" fill="#f1f5f9"/>
        <rect x="202" y="18" width="12" height="26" rx="13" fill="url(#g6_s4)"/>
        <text x="230" y="35" font-weight="800" font-size="8.5" fill="#991b1b">4%</text>

        <!-- Result Box -->
        <rect x="495" y="8" width="357" height="46" rx="4" fill="#fef2f2" stroke="#fecaca"/>
        <text x="505" y="22" font-weight="700" font-size="8.5" fill="#991b1b">Resultado Proyectado:</text>
        <text x="505" y="34" font-size="7.8" fill="#334155">• Oferta patronal a la baja impuesta (<tspan font-weight="700">5% al 7,6% hasta 2030</tspan>)</text>
        <text x="505" y="46" font-size="7.8" fill="#334155">• Mantenimiento de techos de IPC + Conflicto latente y desafección</text>
      </g>
    </svg>
  </div>`;
}

// Resolve paths with CLI overrides
const defaultMdPath = path.resolve(__dirname, '../docs/Guia_Estrategica_Negociacion_Huelga_Airbus_2026.md');
const inputMdPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultMdPath;
const outputHtmlPath = process.argv[3] ? path.resolve(process.argv[3]) : '/tmp/guia_airbus_final.html';

if (!fs.existsSync(inputMdPath)) {
  console.error(`Error: Input markdown not found at ${inputMdPath}`);
  process.exit(1);
}

const rawMd = fs.readFileSync(inputMdPath, 'utf-8');
const svgGenerators = [
  getDiagram1(),
  getDiagram2(),
  getDiagram3(),
  getDiagram4(),
  getDiagram5_Threats(),
  getDiagram6_Probabilities()
];

let diagramIdx = 0;
// Replace Mermaid blocks in markdown with unique comment markers
const processedMd = rawMd.replace(/```mermaid[\s\S]*?```/g, () => {
  const marker = `<!-- INJECT_SVG_MARKER_${diagramIdx} -->`;
  diagramIdx++;
  return `\n\n${marker}\n\n`;
});

let body = marked.parse(processedMd);

// Inject raw SVGs after marked parsing to avoid markdown escaping
svgGenerators.forEach((svg, idx) => {
  body = body.replace(`<!-- INJECT_SVG_MARKER_${idx} -->`, svg);
});

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Guía Estratégica Huelga Airbus España 2026</title>
<style>
  @page {
    size: A4;
    margin: 10mm 10mm 10mm 10mm;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.34;
    color: #0f172a;
    background: #ffffff;
    padding: 0;
    margin: 0 auto;
    font-size: 8.3pt;
  }
  h1 {
    font-size: 13.5pt;
    color: #0f172a;
    border-bottom: 2.5px solid #0284c7;
    padding-bottom: 3px;
    margin-top: 0;
    margin-bottom: 5px;
    font-weight: 800;
  }
  h2 {
    font-size: 10.5pt;
    color: #0369a1;
    border-bottom: 1.2px solid #cbd5e1;
    padding-bottom: 2px;
    margin-top: 9px;
    margin-bottom: 4px;
    page-break-after: avoid;
    break-after: avoid;
    font-weight: 700;
  }
  h3 {
    font-size: 9pt;
    color: #0f172a;
    margin-top: 7px;
    margin-bottom: 3px;
    page-break-after: avoid;
    break-after: avoid;
    font-weight: 700;
  }
  h4 {
    font-size: 8.3pt;
    color: #0369a1;
    margin-top: 5px;
    margin-bottom: 2px;
    page-break-after: avoid;
    break-after: avoid;
    font-weight: 700;
  }
  p {
    margin: 0 0 3.5px 0;
    text-align: justify;
  }
  ul, ol {
    margin: 0 0 5px 0;
    padding-left: 15px;
  }
  li {
    margin-bottom: 1.5px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 5px 0;
    font-size: 7.2pt;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 2.5px 4.5px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
  }
  tr:nth-child(even) {
    background-color: #f8fafc;
  }
  hr {
    border: none;
    border-top: 1px solid #cbd5e1;
    margin: 6px 0;
  }
  .infographic-container {
    text-align: center;
    margin: 6px auto;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .exec-svg {
    width: 100%;
    max-height: 235px;
    height: auto;
    display: block;
    margin: 0 auto;
  }
  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 7.2pt;
    background: #f1f5f9;
    padding: 1px 3px;
    border-radius: 3px;
    color: #0369a1;
  }
</style>
</head>
<body>
${body}
</body>
</html>`;

fs.writeFileSync(outputHtmlPath, html, 'utf-8');
console.log(`HTML compiled successfully to ${outputHtmlPath}`);
