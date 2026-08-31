# Feature Specification: Rehaul Visual Flotante "Liquid Glass" y Eliminación de Barra Lateral

**Feature Branch**: `011-floating-glass-ui-rehaul`  
**Created**: 2026-08-31  
**Status**: Draft (Ready for Planning)  
**Input**: "la interfaz dista mucho de la acordada, es un major change no hay barra flotantes, sigue habiendo la barra lateral izquierda, etc. no es una buena implementación de lo acordado y solicitado"

---

## 1. Visión y Propósito del Rediseño

Este incremento corrige y culmina la arquitectura de interfaz de usuario solicitada: **elimina de forma definitiva e integral la barra lateral izquierda (`<aside>`)** que constreñía el espacio visual del dashboard, y establece una **experiencia de usuario 100% flotante, panorámica y de cristal líquido (Liquid Glass 2.0)** sobre fondo negro puro AMOLED (`#000000`).

La interfaz adopta una disposición contemporánea de alta gama (inspirada en Linear, Raycast y Apple VisionOS) donde los controles de navegación flotan sobre el contenido, liberando el 100% del ancho del viewport (`max-w-7xl mx-auto`) para los paneles analíticos, gráficos y simuladores interactivos.

---

## 2. Arquitectura de Componentes Flotantes y Estructura Visual

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  [TOP FLOATING DYNAMIC ISLAND HUD]: Píldora Centrada con KPIs en Vivo | AIR.PA | Estado     │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  [CRYSTAL FLOATING NAVBAR]: 6 Píldoras Translúcidas de Módulo con Badges de Telemetría      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│  CONTENEDOR PANORÁMICO FULL-WIDTH (max-w-7xl mx-auto px-4 sm:px-6 lg:px-8):                │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 1. CABECERA HERO DEL MÓDULO (Cristal Líquido con Micro-Glow)                          │  │
│  │    • Título y Subtítulo con Geist Sans / Inter Display                                │  │
│  │    • Citas Oficiales (BOE, SIMA, Airbus IR)                                           │  │
│  ├───────────────────────────────────────────────────────────────────────────────────────┤  │
│  │ 2. REJILLA ATÓMICA DE TARJETAS KPI (4 Columnas Desacopladas, Espaciado 8pt)            │  │
│  │    • Cifras Tabulares en Geist Mono / JetBrains Mono                                  │  │
│  │    • Bordes Especulares (rgba(255,255,255,0.12)) + Desenfoque (blur(24px))             │  │
│  ├───────────────────────────────────────────────────────────────────────────────────────┤  │
│  │ 3. ZONA ANALÍTICA PRINCIPAL:                                                          │  │
│  │    ┌───────────────────────────────────┐  ┌────────────────────────────────────────┐  │  │
│  │    │ Controles Reactivos (Sliders/Dials│  │ Gráficos Resilientes Chart.js /        │  │  │
│  │    │ e Inputs de Formulario)           │  │ Tablas Comparativas en 10 Dimensiones  │  │  │
│  │    └───────────────────────────────────┘  └────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                             │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  [FLOATING BOTTOM DOCK / ACTIONS]: Botón Volver Arriba | Descargar PDF | Calculadora Rápida  │
│  [FLOATING RIGHT DRAWER]: Calculadora Salarial Deslizable (Emerge desde la derecha)         │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. User Scenarios & Testing *(mandatory)*

### User Story 1 - Supresión Total de Barra Lateral y Navegación Flotante Superior (Priority: P1) 🎯 MVP

**Descripción**: Como usuario que accede al dashboard, quiero una vista panorámica limpia sin barras laterales estáticas ni columnas fijas a la izquierda, navegando entre los 6 módulos a través de una barra de navegación superior de cristal líquido (`Floating Crystal Navbar`), para disponer de todo el ancho de pantalla para la visualización de datos y gráficos sin sensación de plantilla de administración clásica.

**Why this priority**: Es el cambio estructural principal demandado. Desbloquea la disposición panorámica en desktop y unifica el layout responsivo en móviles y tablets.

**Independent Test**: Cargar el dashboard en cualquier resolución de pantalla y verificar que no existe ninguna columna lateral izquierda `<aside>`, que el contenedor ocupa el ancho central con márgenes equilibrados (`max-w-7xl mx-auto`), y que las 6 pestañas se conmutan instantáneamente desde la barra flotante superior.

**Acceptance Scenarios**:
1. **Given** el usuario abre la web, **When** examina la estructura de la página, **Then** el 100% del contenido se organiza en un único flujo vertical centrado sin barra lateral izquierda.
2. **Given** el usuario pulsa sobre cualquiera de las 6 píldoras del selector superior de módulos, **When** conmuta de pestaña, **Then** la pestaña activa cambia de inmediato, la píldora muestra el resaltado activo de cristal cian/azul, el scroll se sitúa en la parte superior (`scrollTop = 0`) y los gráficos se redimensionan sin distorsión.

---

### User Story 2 - Dynamic Island HUD Superior y Dock Flotante de Acciones (Priority: P2)

**Descripción**: Como usuario que navega y hace scroll por los extensos módulos de datos, quiero un HUD superior compacto flotante (Dynamic Island) y un Dock inferior de acciones rápidas, para mantener visible la telemetría crítica del conflicto (cotización AIR.PA, días de huelga, asimetría de costes) y acceder a herramientas clave (subir arriba, descargar guía PDF, calculadora rápida) en todo momento.

**Why this priority**: Aporta la experiencia de interactividad flotante solicitada, resolviendo la pérdida de contexto durante la lectura de informes largos.

**Independent Test**: Hacer scroll por cualquier módulo largo; verificar que la Dynamic Island superior permanece fija/flotante con micro-datos actualizados y que el dock inferior permite regresar al inicio o descargar el PDF con un solo clic.

**Acceptance Scenarios**:
1. **Given** el usuario se desplaza verticalmente (scroll > 150px), **When** visualiza la parte superior de la ventana, **Then** la Dynamic Island flotante permanece anclada con desenfoque de fondo (`backdrop-filter: blur(24px)`), mostrando la cotización de AIR.PA, el estado de la huelga y el botón de acceso rápido.
2. **Given** el usuario pulsa el botón flotante de retorno, **When** hace clic en el botón "Volver Arriba", **Then** la página realiza un scroll suave instantáneo a la cabecera del módulo actual.

---

### User Story 3 - Drawer Lateral Deslizable de Calculadora Salarial & Tarjetas de Cristal Líquido (Priority: P3)

**Descripción**: Como trabajador o delegado sindical, quiero poder abrir una Calculadora Salarial Rápida en un panel deslizable (Drawer) desde cualquier parte del portal, para simular mi pérdida salarial y el retorno de la huelga sin abandonar el módulo que estoy leyendo.

**Why this priority**: Complementa la experiencia de usuario interactiva y desacopla la herramienta de cálculo individual de la pestaña principal de poder adquisitivo.

**Independent Test**: Pulsar el trigger de la calculadora en el HUD o dock flotante; verificar que el drawer emerge suavemente desde el borde derecho con controles reactivos y que al cerrarlo la página mantiene intacto su estado.

**Acceptance Scenarios**:
1. **Given** el usuario está en el Módulo 1 (Financiero) o Módulo 2 (Beluga), **When** pulsa el botón "Calculadora Rápida", **Then** se despliega un panel lateral off-canvas translúcido con los sliders de salario base e IPC y el cálculo de indemnización/recuperación en tiempo real.
2. **Given** el usuario ajusta el dial de salario en el drawer, **When** desliza el control, **Then** las tarjetas de impacto neto se recalculan en tiempo real sin lag y con tipografía tabular monoespaciada (*Geist Mono*).

---

## 4. Edge Cases

- **Resoluciones Ultrawide (> 2560px)**: El contenedor principal se mantiene restringido a `max-w-7xl` centrado para evitar líneas de texto excesivamente largas y gráficos desproporcionados.
- **Dispositivos Móviles (< 640px)**: La barra flotante superior se adapta a un scroll horizontal táctil con inercia nativa y botones táctiles optimizados (mínimo 44px de altura).
- **Navegadores sin soporte de `backdrop-filter`**: Se aplican fallbacks con colores sólidos translúcidos (`rgba(10, 10, 12, 0.92)`) garantizando legibilidad total.
- **Conmutación rápida entre pestañas**: El motor de destrucción y re-renderizado de gráficos (`renderResilientChart`) previene solapamientos de canvas y fugas de memoria.

---

## 5. Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE eliminar por completo la etiqueta `<aside>` y cualquier barra lateral izquierda fija de la plantilla HTML y de los scripts de control.
- **FR-002**: El sistema DEBE estructurar todo el contenido en un contenedor central panorámico `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` sobre fondo negro AMOLED puro (`#000000`).
- **FR-003**: El sistema DEBE proporcionar una barra de navegación flotante superior (`Floating Crystal Navbar`) con 6 selectores modulares tipo píldora translúcida con efectos de hover e iluminación activa.
- **FR-004**: El sistema DEBE proporcionar una Dynamic Island superior flotante (`#floating-hud`) fija en el viewport con KPIs en vivo (AIR.PA, días de conflicto, asimetría, ratio de apalancamiento).
- **FR-005**: El sistema DEBE proporcionar un Drawer deslizable lateral (`#quick-calc-drawer`) activable desde el HUD o dock flotante para el cálculo salarial reactivo.
- **FR-006**: El sistema DEBE implementar un dock flotante de acciones rápidas (`#floating-dock`) con trigger de retorno arriba (`scroll-to-top`) y enlace directo a la Guía PDF.
- **FR-007**: El sistema DEBE formatear todas las cifras numéricas y financieras con tipografía monoespaciada tabular (*Geist Mono* / *JetBrains Mono*) para evitar saltos visuales en tiempo real.
- **FR-008**: Todas las tarjetas DEBEN utilizar tokens de cristal líquido con `backdrop-filter: blur(24px) saturate(180%)`, bordes de `1px solid rgba(255, 255, 255, 0.10)` y sombras suaves difusas.

---

## 6. Success Criteria *(mandatory)*

- **SC-001**: 100% de la superficie útil de la ventana en desktop se destina al contenido principal, con **0 píxeles ocupados por barras laterales fijas a la izquierda**.
- **SC-002**: El tiempo de respuesta en la conmutación entre módulos analíticos es inferior a **16 ms** (renderizado en un único frame a 60 fps).
- **SC-003**: 100% de los 12 gráficos Chart.js se redimensionan automáticamente sin clipping ni desbordamiento horizontal en pantallas desde 320px hasta 4K.
- **SC-004**: El paso de validación de invariantes matemáticas (`python3 src/validate_invariants.py`) y estructura DOM (`python3 src/validate_sources.py`) se supera con **0 errores y 100% de balance de etiquetas**.
- **SC-005**: El 100% de las citas y fuentes primarias oficiales (BOE, SIMA, INE, Airbus IR) permanecen accesibles con enlaces verificables en cada módulo.

---

## 7. Assumptions & Dependencies

- **Asunción 1**: No se requieren bibliotecas externas de interfaz pesadas; TailwindCSS vía CDN, Lucide Icons y Chart.js nativo cubren el 100% de las necesidades estéticas y dinámicas.
- **Asunción 2**: La estructura de datos unificada de `data/conflict_metrics.json` y `dashboard/data.js` se mantiene como la única fuente de verdad para todos los módulos.
