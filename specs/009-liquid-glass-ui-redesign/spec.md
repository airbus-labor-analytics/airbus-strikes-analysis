# Feature Specification: Rediseño Visual y Experiencia de Usuario "Liquid Crystal" & AMOLED Black

**Feature Branch**: `009-liquid-glass-ui-redesign`  
**Created**: 2026-08-31  
**Status**: Draft (In Clarification & Iteration)  
**Input**: "la web necesita un gran lavado de cara. mejoras en el ui ux, estilo basado en liquid cristal, fondo amoled black, letras y tipografia aesthetics, mejorar usabilidad con elementos flotantes que aparecen y desaparecen para usabilidad e interactuabilidad con la web, hazme propuestas de como ha de ser, como se deben estructurar los paneles, disgregrando aun mas la información, marcando bien los espaciados y como son cada uno de los elementos del front para una mejora total de la interfaz, toma ejemplos de internet de dashboards de referencia estetica avalados por su profesionalidad, haz que no se vea una interfaz generica, iteremos tantas veces como sea necesario y clarifica cada uno de los puntos, para que quede una interfaz y una web estructurada y visualmente como la quiero"


## Clarifications

### Session 2026-08-31
- Q: ¿Cómo debe comportarse la cabecera principal y el menú de navegación entre pestañas durante el desplazamiento (scroll) por la web? → A: Option A (Dynamic Island Flotante Superior: cabecera fija de cristal en reposo que se contrae en una píldora compacta flotante al hacer scroll con KPIs en vivo y selector rápido de módulos).
- Q: ¿Qué nivel de intensidad visual y translucidez debe tener el efecto Liquid Crystal sobre el fondo negro AMOLED? → A: Híbrido Option A + Option C (Cristal Líquido de Alta Fidelidad con `blur(24px) saturate(180%)` y reflejos especulares superiores, fusionado con acentos Aero-Industriales en cian eléctrico y verde esmeralda con micro-glows de alto contraste inspirados en telemetría aeroespacial).
- Q: ¿Cómo debe desplegarse e interactuar la Calculadora Salarial Rápida cuando se activa desde un elemento flotante en cualquier sección? → A: Option A (Drawer Deslizable Lateral de Cristal Líquido: panel lateral off-canvas translúcido que emerge desde la derecha con sliders reactivos y métricas en tiempo real sin tapar completamente el contenido de fondo).
- Q: ¿Cómo deben comportarse los gráficos interactivos (Chart.js) y las tablas de datos al pasar el cursor (hover) y conmutar series? → A: Option A (Tooltips Glassmórficos con Micro-Glow: tooltips de cristal líquido con borde iluminado y tipografía tabular monoespaciada, resaltado suave al pasar el cursor y conmutación instantánea de series sin recargas pesadas).
- Q: ¿Cómo deben cargarse e integrarse las familias tipográficas modernas (Geist Sans, Inter Display, JetBrains Mono) en el dashboard? → A: Option A (Carga Híbrida Inteligente: enlace a fuentes web modernas Geist, Inter, JetBrains Mono con fallback local robusto en fuentes de sistema premium SF Pro, Segoe UI, monospace para compatibilidad offline total).
---

## 1. Visión y Referencias Estéticas de Vanguardia

Este rediseño transforma el portal de análisis de la huelga de Airbus España en un **Centro de Inteligencia Estratégica de nivel mundial**, abandonando el aspecto de plantilla genérica para adoptar un lenguaje visual sofisticado inspirado en las interfaces profesionales más aclamadas de la industria:

### 1.1. Referencias y Lenguaje de Diseño Internacional
- **Linear & Raycast**: Fondo **AMOLED Black puro (`#000000`)**, bordes ultrafinos de 1px con refracción de luz (`rgba(255, 255, 255, 0.08)` a `0.15`), micro-glows direccionales en cian, esmeralda, ámbar y carmesí según la criticidad del dato.
- **Apple VisionOS & macOS Sonoma (Liquid Crystal / Glassmorphism 2.0)**: Tarjetas y paneles de cristal líquido con `backdrop-filter: blur(24px) saturate(180%)`, reflejos especulares sutiles en la esquina superior izquierda de cada contenedor y profundidad multicapa sin ruido visual.
- **Vercel & Stripe Dashboard Density**: Disgregación inteligente de la información. En lugar de acumular métricas densas en una sola tarjeta, la información se divide en **módulos atómicos con espaciados calculados (sistema de rejilla de 8pt con `gap-6` y `gap-8`)**, jerarquía tipográfica milimétrica y respiración espacial que evita la fatiga cognitiva.
- **Tipografía "Aesthetics"**: Interfaz basada en una combinación tipográfica moderna:
  - **Titulares y Textos**: *Geist Sans* / *Inter Display* con espaciado ajustado (`tracking-tight`) y pesos balanceados (`font-semibold` / `font-bold`).
  - **Métricas y Números Financieros**: *Geist Mono* / *JetBrains Mono* en estilo tabular para alineación perfecta de cifras en euros (€), porcentajes y fechas.
  - **Etiquetas Micro**: Mayúsculas compactas (`text-[10px] uppercase tracking-widest font-black`) con badges translúcidos.

---

## 2. Propuesta de Arquitectura de Paneles y Disgregación de la Información

La navegación se estructura en un **Sistema de 6 Paneles Temáticos Modulares**, complementados con elementos flotantes interactivos:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  [FLOATING GLOBAL HUD / DYNAMIC ISLAND]: KPIs Clave en Vivo | Buscador | Acciones Rápidas    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  [CRYSTAL NAVIGATION BAR]: Selector de 6 Módulos con Píldoras Translúcidas y Micro-Badges   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│  PANEL ACTIVO (Ejemplo: Poder Adquisitivo & Negociación):                                   │
│  ┌─────────────────────────────────┐   ┌──────────────────────────────────────────────────┐  │
│  │ 1. PANEL LATERAL DE CONTROLES   │   │ 2. REJILLA DE TARJETAS KPI ATÓMICAS (LÍQUIDAS)   │  │
│  │    • Salario Base con Dial      │   │    • 4 Tarjetas de Cristal Líquido (Glow Activo) │  │
│  │    • Slider IPC & Antigüedad    │   ├──────────────────────────────────────────────────┤  │
│  │    • Toggle Efecto Abril        │   │ 3. MATRIZ EN 10 DIMENSIONES (PANEL EXPANDIBLE)   │  │
│  └─────────────────────────────────┘   │    • Vista Tabular Pura con Badges de Estado     │  │
│                                        ├──────────────────────────────────────────────────┤  │
│                                        │ 4. GRÁFICO RESILIENTE CON LEYENDA FLOTANTE       │  │
│                                        │    • 4 Series con Tooltips Glassmórficos         │  │
│                                        └──────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  [FLOATING CONTEXT DRAWER / QUICK CALCULATOR]: Drawer deslizable que emerge desde la derecha│
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.1. Estructura Desglosada por Paneles
1. **Panel 0: Portal Hub & Centro de Mando (Landing)**
   - Hero interactivo con tarjeta de cristal central, pulso de actividad del conflicto y 5 compuertas visuales hacia los módulos analíticos.
   - 4 Flash KPIs desacoplados con iluminación de fondo reactiva.
2. **Panel 1: Centro Financiero & Asimetría de Poder**
   - Disgregación en 3 zonas: (a) Récords de Facturación y Dividendos Airbus SE, (b) Impacto Bursátil y Destrucción de Capital (-14.459 M€), (c) Comparativa del Coste de la Plataforma frente al Beneficio Neto.
3. **Panel 2: Termómetro Industrial & Logística Beluga**
   - Monitor de vuelos ADS-B de la flota Beluga con indicador de buffer restante en las FALs europeas (60h límite).
   - Matriz de riesgo operativo por factoría (Getafe, Illescas, Puerto Real, San Jerónimo, Tablada, Albacete, Barajas).
4. **Panel 3: Poder Adquisitivo & Negociación SIMA**
   - Simulador Salarial Re-arquitecturado: Panel de controles a la izquierda y resultados en vivo a la derecha en tarjetas flotantes.
   - Matriz Comparativa en 10 Dimensiones: Filas con micro-animación de hover y citas jurídicas integradas.
   - Gráfico de Evolución Salarial a 5 Años con 4 datasets interactivos.
5. **Panel 4: Fuerza Sindical & Soberanía Asamblearia**
   - Mapa electoral de representación sindical (198 delegados / 7 centros).
   - Escrutinio interactivo del Referéndum del 24-J (5.860 Sí vs 6.229 No).
6. **Panel 5: Archivo Documental & Evidencias Telegram**
   - Explorador de actas y minutas oficiales con chips de filtrado rápido y visualizador modal translúcido.

---

## 3. Elementos Flotantes e Interactividad Avanzada (HUD & Drawers)

Para maximizar la usabilidad sin sobrecargar el espacio visual:
1. **Floating Dynamic Island (Cabecera Flotante)**:
   - Aparece suavemente al hacer scroll hacia abajo y se compacta para mostrar: días de huelga transcurridos, coste acumulado para Airbus SE, selector rápido de módulo y botón de acceso al simulador.
2. **Floating Context Drawer (Calculadora Salarial Rápida)**:
   - Panel deslizable desde el lateral derecho que permite ajustar el salario base y ver el retorno de la huelga (ROI) desde cualquier pestaña del dashboard sin necesidad de desplazarse a la pestaña de salarios.
3. **Floating Quick-Action Dock (Barra de Herramientas Inferior Flotante)**:
   - Acceso rápido a: Descargar Dossier PDF, Copiar Enlace Directo a la Sección, Filtrar Fuentes Primarias, y Botón "Volver Arriba" con micro-indicador de progreso de lectura.
4. **Tooltips Líquidos con Micro-Cards**:
   - Al pasar el cursor sobre cualquier dato financiero o legal, emerge un tooltip de cristal líquido con la fuente oficial (BOE, SIMA, INE, Airbus IR) y su fecha de verificación.

---

## 4. User Scenarios & Testing *(mandatory)*

### User Story 1 - Experiencia Visual AMOLED Black y Sistema de Cristal Líquido (Priority: P1) 🎯 MVP

**Descripción**: Como usuario o trabajador que accede al portal, quiero una interfaz inmersiva con fondo negro puro AMOLED, tarjetas de cristal líquido translúcidas con bordes refráctiles y tipografía estética de alta legibilidad, para disponer de una herramienta analítica profesional que transmita rigor y vanguardia tecnológica.

**Why this priority**: Es la base del nuevo lenguaje de diseño. Define la paleta de color, las capas de elevación, los tokens de cristal líquido y la jerarquía tipográfica sobre la que se asientan todos los componentes.

**Independent Test**: Cargar el dashboard en navegadores de escritorio y móviles con modo oscuro nativo y verificar que el fondo es `#000000`, las tarjetas tienen efecto `backdrop-filter`, bordes de 1px translúcidos y cero elementos visuales genéricos o desalineados.

**Acceptance Scenarios**:
1. **Given** el usuario abre la web, **When** visualiza el fondo y las tarjetas, **Then** el fondo es negro AMOLED profundo (`#000000`) y las tarjetas presentan efecto de cristal líquido con desenfoque de fondo y borde superior sutilmente iluminado.
2. **Given** el usuario examina cifras numéricas, **When** lee salarios, porcentajes o fechas, **Then** la tipografía utiliza fuentes monoespaciadas estéticas (*Geist Mono* / *JetBrains Mono*) con alineación tabular impecable.

---

### User Story 2 - Re-Estructuración y Disgregación Espacial de Paneles (Priority: P2)

**Descripción**: Como usuario analítico, quiero que los paneles de información estén claramente desagregados en bloques atómicos con espaciados generosos (`gap-6`, `p-6` a `p-8`) y jerarquía modular, para asimilar los datos complejos de la negociación y la economía de Airbus sin sobrecarga cognitiva.

**Why this priority**: Resuelve la sensación de "interfaz sobrecargada" estructurando la información en bloques lógicos independientes con respiración visual y relaciones visuales coherentes.

**Independent Test**: Navegar por cada uno de los 6 paneles y verificar que ningún bloque supere los límites de densidad recomendados, que los títulos tengan jerarquía clara y que los espaciados sigan la cuadrícula de diseño.

**Acceptance Scenarios**:
1. **Given** el usuario accede al Panel 3 (Poder Adquisitivo), **When** visualiza el simulador y la matriz de 10 dimensiones, **Then** el panel de controles y el panel de resultados se muestran como módulos visuales desacoplados pero sincronizados.
2. **Given** el usuario cambia de panel, **When** se renderizan las tarjetas, **Then** las transiciones entre paneles son instantáneas, con restablecimiento de scroll a `scrollTop = 0` y ajuste responsivo de gráficos sin distorsión.

---

### User Story 3 - Elementos Flotantes de Usabilidad e Interactividad (HUD, Drawers & Docks) (Priority: P3)

**Descripción**: Como usuario que navega por documentos extensos, quiero elementos flotantes interactivos (Dynamic Island superior, Quick Calculator Drawer lateral y Dock de herramientas inferior) que aparezcan contextualmente al interactuar o desplazarse, para acceder a funciones críticas desde cualquier sección de la web.

**Why this priority**: Eleva la experiencia de usuario de estática a dinámica, facilitando el acceso a cálculos salariales, descargas de dossiers y navegación rápida con micro-animaciones fluidas.

**Independent Test**: Hacer scroll por cualquier página extensa y confirmar que el HUD superior aparece suavemente, que pulsar el disparador de la calculadora abre el drawer lateral interactivo sin recargar la página, y que el botón de volver arriba responde con suavidad.

**Acceptance Scenarios**:
1. **Given** el usuario se desplaza más de 300px hacia abajo, **When** el scroll supera el umbral, **Then** la cabecera flotante (Dynamic Island) se anima hacia la vista con métricas de síntesis y selector de pestañas.
2. **Given** el usuario hace clic en el botón flotante "Calculadora Rápida", **When** se abre el Drawer lateral, **Then** puede manipular su salario base y ver el retorno neto proyectado sin perder su posición de lectura actual.

---

## 5. Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE implementar una paleta de color AMOLED Black con fondo base `#000000`, superficies elevadas `#050505` a `#0a0a0a` y acentos lumínicos semitransparentes en cian (`rgba(56, 189, 248, 0.15)`), esmeralda (`rgba(16, 185, 129, 0.15)`), ámbar (`rgba(245, 158, 11, 0.15)`) y rosa carmesí (`rgba(244, 63, 94, 0.15)`).
- **FR-002**: Todas las tarjetas de datos DEBEN utilizar el estilo **Liquid Crystal** con `backdrop-filter: blur(20px) saturate(180%)`, bordes de `1px solid rgba(255, 255, 255, 0.08)` y reflejo especular en la arista superior.
- **FR-003**: La tipografía DEBE configurarse con *Inter Display* / *Geist Sans* para textos explicativos y *JetBrains Mono* / *Geist Mono* para todas las tablas, salarios, porcentajes y cifras económicas.
- **FR-004**: El sistema DEBE incorporar una **Cabecera Flotante (Dynamic Island)** fija o semi-flotante con transición de opacidad y desplazamiento según la posición de scroll del usuario.
- **FR-005**: El sistema DEBE incorporar un **Context Drawer Lateral** desplegable para la simulación rápida de salarios e impacto de huelga, accesible desde cualquier pestaña.
- **FR-006**: Todos los paneles DEBEN respetar el espaciado modular de 8pt con márgenes internos de `p-5` a `p-8` y separadores de sección con línea de brillo sutil (`border-slate-800/80`).
- **FR-007**: Los 12 gráficos Chart.js DEBEN actualizarse con tema oscuro AMOLED (rejillas tenues `rgba(255,255,255,0.05)`, textos `#94a3b8` y tooltips de cristal líquido).
- **FR-008**: El sistema DEBE cumplir estrictamente con el Principio Constitucional VI (reinicio de `scrollTop = 0` y redimensionamiento de lienzos `.resize()` en cada cambio de vista).

---

## 6. Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La interfaz obtiene un índice de contraste de color accesible WCAG AAA (> 7:1) en todos los textos sobre fondos AMOLED y tarjetas translúcidas.
- **SC-002**: El tiempo de respuesta de apertura del Drawer lateral y la animación de la cabecera flotante es inferior a 16ms (60 FPS fluidos garantizados en CSS/JS nativo).
- **SC-003**: 100% de las 6 pestañas y 12 gráficos Chart.js se renderizan sin artefactos visuales, desbordamientos horizontales ni colisiones de canvas en resoluciones desde 360px (móvil) hasta 4K (escritorio).
- **SC-004**: El balance de etiquetas HTML y la validación estática de `src/validate_sources.py` y `tests/test_dashboard_ui.py` se mantiene al 100% de éxito (cero errores DOM).

---

## 7. Resumen de Decisiones de Clarificación

Todas las decisiones de diseño e interactividad han sido clarificadas y ratificadas:
1. **Cabecera Flotante**: Dynamic Island superior compacta que emerge suavemente en scroll con KPIs y selector rápido.
2. **Estilo Visual**: Cristal Líquido de Alta Fidelidad (`blur(24px) saturate(180%)`) fusionado con acentos Aero-Industriales en cian y esmeralda.
3. **Calculadora Salarial**: Drawer lateral deslizable (*off-canvas*) translúcido con sliders reactivos.
4. **Gráficos & Tablas**: Tooltips glassmórficos con micro-glow y resaltado de fila activa sin animaciones bloqueantes.
5. **Tipografía**: Pila híbrida con *Geist Sans* / *Inter* / *JetBrains Mono* y fallback en fuentes nativas del sistema.
