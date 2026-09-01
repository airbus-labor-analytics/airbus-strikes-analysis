# Research: Custom Wage Proposal Builder & Invariant Modeling

**Branch**: `013-custom-wage-proposal-builder` | **Date**: 2026-09-01

## R-001: Modelado Matemático de la Cláusula de Garantía Salarial (RSG) con Topes (Caps)

**Decision**: Implementar una función determinista de actualización anual que soporte 3 modos de RSG con evaluación de topes por periodo.

```javascript
function evaluateAnnualRaise(ipcRate, rsgMode, rsgMargin, rsgCap) {
  let nominalRaise = 0.0;
  if (rsgMode === 'none') {
    nominalRaise = rsgMargin; // Tasa fija independiente del IPC
  } else if (rsgMode === 'ipc_100') {
    nominalRaise = ipcRate;
  } else if (rsgMode === 'ipc_margin') {
    nominalRaise = ipcRate + rsgMargin;
  }
  
  // Aplicar tope (cap) si está definido
  if (rsgCap !== null && rsgCap !== undefined && rsgCap > 0) {
    nominalRaise = Math.min(nominalRaise, rsgCap);
  }
  
  return Math.max(nominalRaise, 0.0);
}
```

**Rationale**: Cubre el 100% de las modalidades de negociación colectiva en el sector aeroespacial: revisiones al IPC real, revisiones con plus de productividad ($+\Delta\%$), revisiones a la baja ($-\Delta\%$), y cláusulas con techo de absorción patronal.

**Alternatives Considered**:
- Solo permitir 100% IPC fijo: Rechazado porque no permite modelar contraofertas intermedias ni la plataforma del comité (+1,5%).
- Permitir fórmulas arbitrarias en texto: Rechazado por riesgo de fallos en parsing y violación de seguridad en cliente.

---

## R-002: Algoritmo de Meta de Recuperación del Poder Adquisitivo (Recovery Horizon Solver)

**Decision**: Resolver algebraicamente la tasa inicial requerida $r^*$ dado un año horizonte $Y \in [2026, 2030]$, la tasa de IPC proyectada $i$, y la pérdida acumulada histórica $L_{2020-2025} = 11,8\%$.

$$\text{Para recuperar el } 100\% \text{ del poder adquisitivo en el año } Y:$$
$$S_Y^{\text{real}} = S_0 \times (1 + L_{\text{hist}})$$
$$\text{Si la cláusula RSG = IPC:} \quad r^* = L_{\text{hist}} = 11,8\%$$
$$\text{Si la cláusula RSG = IPC} + m: \quad r^* = \frac{1 + L_{\text{hist}}}{(1 + m)^{Y - 2025}} - 1$$

**Rationale**: Ofrece al asambleísta una respuesta cuantitativa instantánea a la pregunta fundamental: *"¿Cuánto tenemos que pedir en tablas para no perder ni un euro respecto a 2020 en 2028 o 2030?"*.

---

## R-003: Ergonomía de la Interfaz: Controles In-Place vs. Panel Externo

**Decision**: Integrar los controles directamente en la 3ª tarjeta ("Tu Propuesta Personalizada") utilizando micro-controles (mini sliders para % subida y atrasos, segmented toggle para modo RSG, y 3 botones de preset superior).

**Rationale**: Mantiene el principio de spatial clarity del diseño Liquid Crystal AMOLED sin sobrecargar el scroll vertical. El usuario ajusta un slider y ve instantáneamente el salario Año 1, la nómina neta mensual, el tooltip de la fórmula y la curva en los gráficos.
