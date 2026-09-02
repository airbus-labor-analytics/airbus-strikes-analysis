# Quickstart & Validation Guide: Welcome Pack al Conflicto

**Feature**: `017-conflict-welcome-pack`  
**Date**: 2026-09-02

---

## 1. Prerequisites

- Python 3.10+
- Navegador web moderno o visualizador estático de HTML
- Repositorio en la rama `017-conflict-welcome-pack`

---

## 2. Compilation & Verification Commands

### Step 1: Generar Dossier Markdown del Welcome Pack
```bash
python3 src/generate_welcome_pack.py
```
*Resultado esperado*: Genera `docs/Welcome_Pack_Conflicto_Airbus_2026.md` sincronizado con `data/conflict_metrics.json`.

### Step 2: Validar Invariantes y Monotonicidad Temporal
```bash
python3 src/validate_invariants.py
python3 src/validate_timeline_freshness.py
```
*Resultado esperado*: 15/15 reglas de invariantes y verificación de frescura temporal en verde (`0 days delta`).

### Step 3: Ejecutar Suite Completa de Pruebas
```bash
python3 -m unittest discover tests/
```
*Resultado esperado*: Todas las pruebas unitarias e invariantes pasan al 100% sin advertencias.

---

## 3. UI Smoke Test

1. Abrir `dashboard/index.html` en el navegador (compatible con protocolo `file://`).
2. Verificar la presencia de la pestaña «Guía del Conflicto & Welcome Pack» (`#tab-welcome-pack`) en la barra de navegación superior.
3. Hacer clic en el botón «¿Qué nos ha llevado aquí?» del banner superior y comprobar que navega directamente a la guía.
4. Explorar las 3 fases temporales y abrir el modal de una minuta haciendo clic en «Ver Minuta Íntegra».
