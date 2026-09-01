# Feature Specification: Constructor y Simulador de Oferta Salarial Personalizada

**Feature Branch**: `013-custom-wage-proposal-builder`  
**Created**: 2026-09-01  
**Status**: Draft  
**Input**: Eliminar la oferta salarial de SIMA que es una invención, e introducir una forma de generar y simular tu propia oferta, con y sin linkado a IPC, imponiendo máximos a IPC a suma completa, a recuperación en 2030 (o cualquier otro año), ajustándose con posibles variantes de las ofertas existentes.

## Executive Summary

El módulo de cálculo salarial y simulación de poder adquisitivo (`#tab-purchasing-power`) debe reflejar con total rigor y veracidad las plataformas reales de negociación. En la mediación del SIMA no existió una propuesta económica formal cerrada de "+9,5% consolidado", por lo que debe eliminarse como oferta oficial preestablecida.

En su lugar, se incorpora un **Constructor y Simulador Paramétrico de Oferta Personalizada** que permite a cualquier trabajador, delegado o analista modelar cualquier propuesta alternativa:
1. Subida salarial inicial en tablas ($S_1$) y atrasos retroactivos.
2. Cláusula de Garantía Salarial (RSG) configurable: sin linkado a IPC, con 100% IPC, o IPC $\pm \Delta\%$, con o sin topes anuales/acumulados (*caps*).
3. Función de optimización y meta de recuperación de poder adquisitivo acumulado (ej. recuperación total del 100% de la pérdida del VI Convenio en 2028, 2030 u otro año horizonte).
4. Comparativa dinámica en tiempo real (tarjeta de escenario reactiva y series en gráficos de evolución multianual) frente a la Oferta Patronal oficial (+5%) y la Plataforma del Comité (+12%).

---

## User Scenarios & Testing

### User Story 1 (P1) - Eliminación de Oferta Ficticia y Tarjetas Canónicas
- **Actor**: Trabajador o analista sindical de Airbus.
- **Acción**: Accede al Simulador de Salarios (`#tab-purchasing-power`).
- **Resultado esperado**:
  - Las dos ofertas base oficiales presentadas son:
    1. **Oferta Patronal Airbus SE (+5,0% fraccionado)**: con Efecto Abril, 2.000 € paga única, sin RSG.
    2. **Plataforma del Comité de Empresa (+12,0% íntegro)**: sin Efecto Abril, 7.500 € atrasos, RSG = IPC + 1,5% sin topes.
  - La 3ª tarjeta se convierte en **Tu Oferta Personalizada**, que refleja inmediatamente los parámetros seleccionados en el panel constructor de oferta.
- **Test independiente**: Comprobar que en el DOM y en los modelos no queda rastro de "Preacuerdo SIMA +9,5%" como oferta cerrada fija, y que la 3ª tarjeta actualiza su salario Año 1, beneficio neto, y poder de compra real a 5 años según los controles del constructor.

### User Story 2 (P2) - Constructor Paramétrico de Oferta Propia
- **Actor**: Usuario modelando un escenario alternativo o contrapropuesta.
- **Acción**: Ajusta en el panel constructor:
  - **Subida inicial en tablas (%)**: Slider / input (0% a 25%, ej. 8,5%).
  - **Atrasos retroactivos / Paga única (€)**: Input (0 € a 15.000 €).
  - **Modo RSG / Vínculo a IPC**:
    - *Opción A*: Fijo anual (sin linkado a IPC, ej. +1,0% anual).
    - *Opción B*: 100% IPC anual.
    - *Opción C*: IPC + Margen (ej. IPC + 1,0% o IPC - 0,5%).
  - **Topes a la Inflación (Cap)**:
    - *Sin tope* (protección íntegra).
    - *Tope anual máximo* (ej. máx 3,5% o 5,0%).
- **Resultado esperado**:
  - La tarjeta de "Tu Oferta Personalizada" recalcula instantáneamente todas sus métricas con sus tooltips matemáticos correspondientes.
  - El gráfico multianual (`#salaryEvolutionChart`) y el gráfico acumulado (`#wagesChart`) actualizan la serie "Tu Oferta" en tiempo real.
- **Test independiente**: Seleccionar subida 8%, RSG = 100% IPC con tope de 3,0%, y verificar que si el IPC estimado es 4,0%, la subida anual se acota a 3,0% y la pérdida de poder adquisitivo se calcula fielmente.

### User Story 3 (P3) - Calculadora de Meta de Recuperación (Año Objetivo 2026–2030)
- **Actor**: Negociador o asambleísta evaluando qué oferta se necesita para no perder dinero.
- **Acción**: Selecciona un año objetivo de recuperación total (ej. 2028 o 2030) y activa la función "Calcular subida requerida para recuperar el 100% del poder adquisitivo del VI Convenio".
- **Resultado esperado**:
  - El simulador resuelve la ecuación y sugiere los parámetros mínimos necesarios (ej. "+10,8% inicial con RSG = 100% IPC").
  - Muestra la brecha (gap) restante en €/año frente a la inflación histórica acumulada desde 2020.
- **Test independiente**: Fijar meta en 2030 con IPC al 2,5%; comprobar que la herramienta calcula la tasa requerida y permite aplicarla con un clic a los controles de "Tu Oferta".

---

## Functional Requirements

- **FR-001**: El sistema debe eliminar la denominación y datos fijos de "Preacuerdo SIMA (+9,5%)" en datasets, textos, tarjetas de escenario, tablas y gráficos.
- **FR-002**: El sistema debe proporcionar un panel de control interactivo "Constructor de Oferta Personalizada" con inputs reactivos para:
  - Subida salarial inicial en tablas (0,0% a 25,0%).
  - Paga de atrasos retroactivos (0 € a 15.000 €).
  - Modalidad de vinculación a IPC (Sin vincular / 100% IPC / IPC $\pm \Delta\%$).
  - Techo máximo anual de revisión por IPC (Sin techo / 1% a 8%).
- **FR-003**: La 3ª tarjeta comparativa (`#sc3-custom` o similar) debe actualizarse dinámicamente con los valores calculados de la oferta personalizada, incluyendo tooltips algebraicos paso a paso.
- **FR-004**: Los gráficos analíticos (`#salaryEvolutionChart` y `#wagesChart`) deben renderizar la serie "Tu Oferta Personalizada" de forma reactiva y con colores distintivos frente a la Oferta Patronal y la Plataforma del Comité.
- **FR-005**: El sistema debe incluir un selector de Año Objetivo de Recuperación (2026, 2027, 2028, 2029, 2030) que calcule la subida mínima en tablas requerida para alcanzar el 0% de pérdida acumulada respecto a 2020.
- **FR-006**: Todos los cálculos deben satisfacer el Principio I de la Constitución (integridad matemática y conservación sin alucinaciones) y el Principio V (cero librerías externas pesadas, JS/CSS puro).

---

## Success Criteria

1. **Veracidad y Rigor**: Cero referencias en toda la interfaz y codebase a una supuesta "oferta salarial formal SIMA".
2. **Flexibilidad Total**: El usuario puede configurar cualquier combinación de subida inicial, atrasos, fórmula RSG y topes en menos de 3 clics o ajustes de slider.
3. **Latencia Cero**: El recálculo y la actualización de tarjetas y gráficos de Chart.js se ejecutan de forma instantánea ($< 20\text{ ms}$) tras cualquier cambio en los controles.
4. **Validación Automática**: 100% de tests unitarios y de invariantes pasando sin discrepancias.

---

## Assumptions & Boundaries

- **Ofertas oficiales fijas**: Se mantienen como referencias canónicas la Oferta Patronal (+5% fraccionado) y la Plataforma del Comité (+12% en tablas).
- **Parámetros de nómina**: La simulación de "Tu Oferta" se aplica sobre el mismo salario base, grupo profesional, quinquenios, turnos y plan de pensiones seleccionados por el usuario.
- **Ámbito**: No se modifican los datos históricos oficiales del VI Convenio (2020–2025), que siguen basándose en datos contrastados del INE/BOE.
