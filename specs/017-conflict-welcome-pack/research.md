# Research & Architectural Decisions: Welcome Pack al Conflicto & Guía Cronológica Primaria

**Feature**: `017-conflict-welcome-pack`  
**Date**: 2026-09-02  
**Status**: Completed

---

## 1. Primary Data Flow & Sourcing Architecture

### Context
El Welcome Pack requiere unificar datos económicos de pérdida de poder adquisitivo, beneficios de Airbus SE, citas textuales autenticadas de actas de asamblea en Telegram y una cronología detallada en 3 fases hasta el 2 de septiembre de 2026 (Día 9 de Huelga General Indefinida).

### Decision
- **Fuente Canónica Única**: Estructurar los datos del Welcome Pack directamente en `data/conflict_metrics.json` bajo la clave `welcome_pack` y enriquecer `timeline` con los campos necesarios de citas textuales y metadatos de minutas.
- **Sincronización Web Offline**: `dashboard/data.js` expondrá el objeto `WELCOME_PACK_DATA` y `TIMELINE_DATA` para garantizar acceso instantáneo <100ms tanto en servidor web como en `file://`.
- **Generador de Dossier Imprimible**: Implementar `src/generate_welcome_pack.py` para compilar automáticamente `docs/Welcome_Pack_Conflicto_Airbus_2026.md` a partir de `data/conflict_metrics.json`.

### Rationale
- Cumple con los Principios I, II, VII y VIII de la Constitución de Airbus Strikes Analysis.
- Evita discrepancias entre el cuadro de mando web y los documentos físicos entregados en asamblea.
- Elimina cualquier dependencia de red externa o renderizado asíncrono pesado.

### Alternatives Considered
- *Dossier Markdown manual*: Descartado por riesgo de desincronización con las cifras del dashboard en futuras actualizaciones.
- *API backend en tiempo real*: Descartada por violar el principio de portabilidad offline (`file://`).

---

## 2. Navigation & UI Integration

### Context
El dashboard ya cuenta con 5 módulos consolidados. Se requiere máxima visibilidad para el Welcome Pack sin saturar la navegación.

### Decision
- Crear la pestaña principal `#tab-welcome-pack` («Guía del Conflicto & Welcome Pack») en el menú de navegación superior.
- Añadir un botón de acceso directo («¿Qué nos ha llevado aquí?») en el hero banner superior que redirige instantáneamente a `#tab-welcome-pack`.
- Enlazar cada hito cronológico con el visor modal existente `OpenSourceModal` (`#source-modal`) para lectura completa de minutas primarias.

### Rationale
- Accesibilidad en 1 clic para nuevos participantes.
- Reutiliza los estilos Tailwind CSS y componentes de modal existentes.

---

## 3. Timezone Awareness & Temporal Freshness

### Context
La regla 15 de la Constitución exige monotonicidad temporal en zona horaria `Europe/Madrid`.

### Decision
- Emplear `zoneinfo.ZoneInfo("Europe/Madrid")` en `src/generate_welcome_pack.py` y `src/validate_invariants.py`.
- Renderizar visiblemente el sello `Última actualización: 2 de septiembre de 2026 - Día 9 de Huelga Indefinida` tanto en el header del dashboard como en la cabecera del dossier Markdown.
