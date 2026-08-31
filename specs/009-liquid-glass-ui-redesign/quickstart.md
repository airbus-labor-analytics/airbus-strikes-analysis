# Quickstart & Verification Scenarios: Rediseño Liquid Crystal & AMOLED Black

**Feature**: `009-liquid-glass-ui-redesign`  
**Date**: 2026-08-31  
**Status**: Completed

---

## 1. Escenarios de Validación Rápida en Navegador

### Escenario 1: Carga Visual Inicial y Fondo AMOLED Black
1. Abrir `dashboard/index.html` en el navegador (vía servidor local o protocolo `file://`).
2. **Verificación visual**:
   - El fondo del viewport es `#000000` (negro puro sin tinte grisáceo).
   - Las tarjetas principales utilizan el efecto de cristal líquido translúcido con desenfoque de fondo y borde superior iluminado.
   - Las tipografías cargan limpiamente (*Geist* / *Inter* en textos, *Geist Mono* / *JetBrains Mono* en números).

### Escenario 2: Desplazamiento y Activación de la Dynamic Island Flotante
1. En cualquiera de las pestañas extensas (p. ej. `#tab-overview` o `#tab-purchasing-power`), hacer scroll hacia abajo más de 150px.
2. **Verificación visual e interactiva**:
   - Emerge fluidamente la **Dynamic Island (`#floating-hud`)** centrada en la parte superior.
   - Muestra el contador de días de huelga y la pérdida de valor acumulada.
   - Al pulsar cualquiera de las píldoras de navegación en el HUD, el dashboard cambia de pestaña instantáneamente y resetea el scroll arriba del todo (`scrollTop = 0`).

### Escenario 3: Interacción con el Quick Calculator Drawer Lateral
1. Pulsar el botón con icono de calculadora en la Dynamic Island o el acceso rápido flotante.
2. **Verificación**:
   - Aparece suavemente el `#quick-calc-drawer` deslizándose desde el borde derecho con fondo oscurecido translúcido.
   - Mover el slider de salario base a `60.000 €` y el slider de días de huelga a `10 días`.
   - Comprobar que el retorno neto mensual y el tiempo de amortización se recalculan en tiempo real dentro del drawer.
   - Pulsar la tecla `Escape` o el botón `X` para cerrar el Drawer.

---

## 2. Comandos de Validación Automatizada

Ejecutar la suite completa de pruebas para garantizar cero regresiones DOM ni fallos de invariantes:

```bash
# 1. Validar jerarquía y balance estricto de etiquetas HTML
python3 src/validate_sources.py

# 2. Validar invariantes matemáticas, electorales y financieras
python3 src/validate_invariants.py

# 3. Ejecutar suite completa de pruebas unitarias y DOM
python3 -m unittest discover tests

# 4. Validar sintaxis JavaScript de los controladores
node -c dashboard/app.js
node -c dashboard/data.js
```
