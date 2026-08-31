# Feature Specification: Rehaul Visual Flotante "Liquid Glass" y Navegación Global Multicapa

**Feature Branch**: `011-floating-glass-ui-rehaul`  
**Created**: 2026-08-31  
**Status**: Ready for Implementation Planning  
**Input**: "la interfaz dista mucho de la acordada, es un major change no hay barra flotantes, sigue habiendo la barra lateral izquierda, etc. no es una buena implementación de lo acordado y solicitado"

---

## Clarifications

### Session 2026-08-31
- **Q1: ¿Cómo debe estructurarse el sistema integral de navegación flotante y sub-secciones?**  
  → **A**: Navbar Superior Dual (HUD compacto + Píldoras de módulos) complementada con un **Floating Dock Global** anclado en la parte inferior para navegar a lo largo de toda la web.
- **Q2: ¿Cómo debe realizarse la disgregación profunda de los paneles densos de información?**  
  → **A**: **Opción D (Modelo Híbrido Integral)**: Tarjetas atómicas limpias en cuadrícula 8pt (`gap-6`/`gap-8`) sobre negro AMOLED (`#000000`) con cristal líquido (`blur(24px)`), modales de detalle profundo y bloques comparativos visuales de alto impacto "Empresa vs Plantilla" en los módulos de Huelga, Beluga y Finanzas.
- **Q3: ¿Cómo debe comportarse la Dynamic Island flotante superior durante el desplazamiento (scroll)?**  
  → **A**: **Auto-Contracción / Expansión Fluida al Scroll**: Cabecera completa en reposo; al hacer scroll hacia abajo (>120px) se contrae fluidamente en una píldora flotante compacta centrada con KPIs en vivo (AIR.PA, días de huelga, asimetría de costes) y selector rápido; al volver arriba se expande suavemente.
- **Q4: ¿Cómo prefieres que se configure el Dock Flotante de Acciones Rápidas?**  
  → **A**: **Dock de Navegación Global**: El dock inferior flotante sirve como barra de navegación principal para recorrer y conmutar fluidamente a lo largo de toda la web (los 6 módulos principales), incorporando además herramientas rápidas (Calculadora, PDF, Volver Arriba con % de scroll).
- **Q5: ¿Cómo debe interactuar el panel de detalle exhaustivo (Drawer/Modal) al activarse?**  
  → **A**: **Modal Flotante Centrado (Glass Modal)**: Cuadro de diálogo modal centrado de alta resolución en cristal líquido con cabecera fija, scroll interno independiente, tipografía tabular y cierre rápido (`Escape`, botón `×` o clic fuera).

---

## 1. Visión y Propósito del Rediseño

Este incremento ejecuta la transformación radical y definitiva de la experiencia de usuario del portal de análisis de huelga de Airbus España. Corrige las carencias del diseño anterior:

1. **Eliminación Total y Definitiva de la Barra Lateral Izquierda (`<aside>`)**: Se erradica por completo la columna lateral fija izquierda que constreñía el ancho del viewport y daba aspecto de plantilla de administración clásica obsoleta.
2. **Arquitectura Panorámica Full-Width (`max-w-7xl mx-auto`)**: Todo el contenido se estructura en un único flujo vertical centrado, limpio, con márgenes calculados y respiración visual de 8pt (`gap-6`, `gap-8`, `p-6` a `p-8`) sobre fondo negro puro AMOLED (`#000000`).
3. **Navegación Flotante Multicapa (Dynamic Island + Global Floating Dock)**:
   - **Arriba**: *Dynamic Island HUD* centrada que se contrae y expande según el desplazamiento vertical.
   - **Abajo**: *Global Floating Dock* de cristal líquido translúcido anclado en la parte inferior central para navegar entre los 6 módulos y acceder a herramientas en cualquier momento.
4. **Disgregación Profunda de la Información**: Descomposición de tablas monolíticas y bloques de texto denso en tarjetas atómicas con micro-badges, bloques comparativos visuales ("Empresa vs Plantilla") y modales de cristal líquido para consulta exhaustiva de evidencias.

---

## 2. Mapa de Arquitectura Visual de Componentes

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  [TOP DYNAMIC ISLAND HUD]: Píldora Flotante Centrada (Auto-Contracción/Expansión al Scroll) │
│  • AIR.PA: 203,05€ (-8,25%) | Huelga: 7 Días (-113,8M€) | Asimetría: 185x | Estado SIMA   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│  CONTENEDOR PANORÁMICO FULL-WIDTH (max-w-7xl mx-auto px-4 sm:px-6 lg:px-8):                │
│                                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 1. CABECERA HERO DEL MÓDULO (Cristal Líquido con Micro-Glow)                          │  │
│  │    • Título y Subtítulo con Geist Sans / Inter Display                                │  │
│  │    • Badges Oficiales (BOE, SIMA, Airbus IR)                                          │  │
│  ├───────────────────────────────────────────────────────────────────────────────────────┤  │
│  │ 2. REJILLA ATÓMICA DE TARJETAS KPI (4 Columnas Desacopladas, Espaciado 8pt)            │  │
│  │    • Cifras Tabulares en Geist Mono / JetBrains Mono                                  │  │
│  │    • Bordes Especulares (rgba(255,255,255,0.12)) + Desenfoque (blur(24px))             │  │
│  ├───────────────────────────────────────────────────────────────────────────────────────┤  │
│  │ 3. BLOQUES COMPARATIVOS DE ALTO IMPACTO (EMPRESA VS PLANTILLA):                       │  │
│  │    ┌───────────────────────────────────┐  ┌────────────────────────────────────────┐  │  │
│  │    │ 🏢 Airbus SE (Beneficio Récord)   │  │ 👷 Plantilla España (Erosión Salarial) │  │  │
│  │    │ • 4.960 M€ Beneficio Neto 2025    │  │ • -26.027 € Pérdida Media 2020-2025    │  │  │
│  │    │ • 2.535 M€ Dividendos (3,20 €/sh) │  │ • Reclamación: 7.500 € + 12% en Tablas │  │  │
│  │    └───────────────────────────────────┘  └────────────────────────────────────────┘  │  │
│  ├───────────────────────────────────────────────────────────────────────────────────────┤  │
│  │ 4. ZONA ANALÍTICA INTERACTIVA:                                                        │  │
│  │    • Controles y Sliders de Simulación Salarial / Asimetría Financiera                │  │
│  │    • 12 Gráficos Resilientes Chart.js con Tooltips Glassmórficos                      │  │
│  │    • Matriz Comparativa en 10 Dimensiones con Filtros y Badges                        │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                             │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  [GLOBAL FLOATING DOCK]: Dock Flotante de Cristal Líquido Anclado en la Parte Inferior      │
│  [ 🏛️ Portal | 📊 Finanzas | ✈️ Beluga | 🧮 Salarios | 👥 Sindicatos | 📂 Evidencias | ▲ Top ]│
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  [CENTERED GLASS MODAL]: Ventana Emergente de Cristal Líquido para Detalles Exhaustivos     │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. User Scenarios & Testing *(mandatory)*

### User Story 1 - Supresión Integral de Barra Lateral y Layout Panorámico Full-Width (Priority: P1) 🎯 MVP

**Descripción**: Como usuario o analista que consulta el dashboard, quiero una vista panorámica limpia y equilibrada sin barra lateral izquierda, con el 100% del ancho del viewport dedicado a los datos, gráficos y simuladores, para disfrutar de una interfaz despejada sin restricciones espaciales artificiales.

**Why this priority**: Es la corrección estructural prioritaria demandada por el usuario. Elimina el aspecto de panel de control genérico y aprovecha todo el ancho de pantalla (`max-w-7xl mx-auto`).

**Independent Test**: Cargar el dashboard en desktop y móvil, verificar que no existe ninguna etiqueta `<aside>` ni columna fija izquierda, y que el ancho del contenedor analítico abarca toda la pantalla central de forma homogénea.

**Acceptance Scenarios**:
1. **Given** el usuario abre la web, **When** examina la disposición del viewport, **Then** no existe ninguna barra lateral izquierda y todo el contenido se presenta en un contenedor central fluido `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
2. **Given** el usuario cambia de resolución (móvil, tablet, monitor ultrawide), **When** se redimensiona la ventana, **Then** el layout se adapta automáticamente con márgenes armónicos de 8pt y sin barras de desplazamiento horizontal parásitas.

---

### User Story 2 - Global Floating Dock Inferior de Navegación por Toda la Web (Priority: P2)

**Descripción**: Como usuario que navega por los diferentes bloques del conflicto, quiero un Dock Flotante anclado en la parte inferior de la pantalla que me permita saltar instantáneamente entre los 6 módulos principales y acceder a funciones rápidas (Volver Arriba, Descargar PDF), manteniéndose siempre accesible con efecto de cristal líquido translúcido.

**Why this priority**: Convierte la navegación en una experiencia flotante moderna, accesible con el pulgar en móviles y centrada ergonómicamente en monitores de escritorio.

**Independent Test**: Hacer clic en cada uno de los 6 iconos/píldoras del Global Floating Dock; verificar que la pestaña activa cambia al instante, el scroll se resetea al inicio (`scrollTop = 0`), el dock resalta la píldora activa con micro-glow y los gráficos se renderizan sin desajustes.

**Acceptance Scenarios**:
1. **Given** el usuario se encuentra en cualquier sección de la web, **When** observa la parte inferior central de la pantalla, **Then** visualiza el Global Floating Dock de cristal líquido con los 6 módulos (`Portal`, `Finanzas`, `Beluga`, `Salarios`, `Sindicatos`, `Evidencias`) y herramientas rápidas.
2. **Given** el usuario hace clic en el icono "Salarios", **When** se produce la interacción, **Then** la web cambia de inmediato al Módulo 3, el dock resalta "Salarios" con borde cian iluminado y el scroll se sitúa en la cabecera.

---

### User Story 3 - Dynamic Island Superior con Auto-Contracción al Scroll (Priority: P3)

**Descripción**: Como usuario que lee informes extensos o analiza gráficos, quiero una Dynamic Island flotante superior que en reposo muestre la cabecera completa y que al hacer scroll hacia abajo se contraiga suavemente en una píldora compacta con telemetría en tiempo real (AIR.PA, días de huelga, asimetría de costes).

**Why this priority**: Proporciona contexto financiero y operativo continuo sin restar espacio vertical de lectura.

**Independent Test**: Desplazar la página hacia abajo más de 120px y verificar que la Dynamic Island se contrae con una transición fluida en una píldora flotante compacta, y que al volver al inicio de la página se expande a su estado completo.

**Acceptance Scenarios**:
1. **Given** el usuario hace scroll hacia abajo (>120px), **When** se activa el umbral de scroll, **Then** la Dynamic Island superior se contrae en una píldora de 44px de altura con desenfoque de fondo `blur(24px)` mostrando cotización AIR.PA en vivo (`203,05€`), estado del conflicto y pérdida acumulada.
2. **Given** el usuario regresa a la parte superior (`scrollY < 60px`), **When** alcanza el inicio, **Then** la Dynamic Island se expande fluidamente mostrando la cabecera institucional completa.

---

### User Story 4 - Disgregación Profunda Híbrida: Tarjetas Atómicas, Comparativas Visuales y Glass Modals (Priority: P4)

**Descripción**: Como delegado sindical, trabajador o periodista, quiero que la información compleja (artículos de convenios BOE, actas de asambleas, desglose salarial, operativa Beluga) esté disgregada en tarjetas atómicas con comparativas visuales directas y modales de cristal líquido para consultar los documentos completos sin abandonar la vista analítica.

**Why this priority**: Resuelve la saturación cognitiva de los bloques de texto denso y maximiza la fuerza persuasiva y pedagógica de los datos del conflicto.

**Independent Test**: Navegar por el Módulo 1, 2 y 3; verificar que existen bloques visuales directos "Empresa vs Plantilla", tarjetas de datos individuales con micro-badges y que al pulsar "Ver Detalle / Evidencia" se abre un Glass Modal centrado con texto exhaustivo y botón de cierre rápido.

**Acceptance Scenarios**:
1. **Given** el usuario examina el Módulo 1 (Financiero), **When** observa la sección de beneficios vs costes, **Then** visualiza un bloque comparativo visual claro "Beneficios y Dividendos Airbus SE vs Masa Salarial y Coste Plataforma".
2. **Given** el usuario pulsa en "Ver Detalle de Convenio" o "Calculadora Salarial Detallada", **When** se abre el Glass Modal centrado, **Then** se presenta la información íntegra con scroll interno independiente, tipografía tabular monoespaciada (*Geist Mono*) y cierre inmediato con tecla `Escape` o botón `×`.

---

## 4. Requisitos Funcionales *(mandatory)*

- **FR-001**: El sistema DEBE suprimir de raíz cualquier etiqueta `<aside>` o barra lateral izquierda fija en el DOM.
- **FR-002**: El sistema DEBE alojar el 100% de los módulos en un contenedor central fluido `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` sobre fondo negro puro AMOLED (`#000000`).
- **FR-003**: El sistema DEBE implementar el **Global Floating Dock** anclado en la parte inferior central del viewport (`fixed bottom-6 inset-x-0 mx-auto w-max z-50`) con cristal líquido translúcido (`backdrop-filter: blur(24px) saturate(180%)`), bordes de 1px (`rgba(255, 255, 255, 0.12)`) y accesos a los 6 módulos más botón de retorno arriba.
- **FR-004**: El sistema DEBE implementar la **Dynamic Island Superior** anclada en la parte superior central con lógica de auto-contracción al superar 120px de scroll vertical y auto-expansión al regresar al inicio.
- **FR-005**: El sistema DEBE implementar el componente **Glass Modal Centrado** (`#glass-detail-modal`) con cabecera fija, cuerpo con scroll interno, soporte para cierre mediante `Escape`, backdrop blur y botón `×`.
- **FR-006**: El sistema DEBE incorporar bloques comparativos visuales estructurados ("Empresa vs Plantilla") en los paneles de Finanzas, Beluga y Negociación Salarial.
- **FR-007**: El sistema DEBE renderizar todas las cantidades numéricas, precios bursátiles, horas de buffer y salarios con tipografía tabular (*Geist Mono* / *JetBrains Mono* / `tabular-nums`) para evitar oscilaciones visuales durante las actualizaciones reactivas.
- **FR-008**: El sistema DEBE gestionar la conmutación de pestañas garantizando reset de scroll (`scrollTop = 0`) y redimensionamiento seguro de los 12 gráficos Chart.js mediante `renderResilientChart`.

---

## 5. Criterios de Éxito *(mandatory)*

- **SC-001**: 100% del viewport horizontal en escritorio queda libre de barras laterales fijas, dedicando el ancho total a los datos.
- **SC-002**: La conmutación entre módulos a través del Global Floating Dock se ejecuta en menos de **16 ms** sin saltos bruscos de maquetación.
- **SC-003**: Los 12 gráficos analíticos Chart.js se visualizan y redimensionan limpiamente sin solapamiento en resoluciones desde 360px hasta 4K.
- **SC-004**: El Glass Modal de detalle se abre y cierra fluidamente manteniendo intacto el estado de la página de fondo.
- **SC-005**: La suite de verificación de invariantes (`python3 src/validate_invariants.py`) y estructura de fuentes (`python3 src/validate_sources.py`) pasa al 100% con cero errores y etiquetas HTML perfectamente balanceadas.
