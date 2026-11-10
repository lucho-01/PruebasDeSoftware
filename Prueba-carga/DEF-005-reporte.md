# Reporte de defecto DEF-005

| Campo | Detalle |
|-------|---------|
| **ID** | DEF-005 |
| **Título** | Con intentos fallidos simultáneos la cuenta nunca se bloquea (condición de carrera en el contador) |
| **Historia / criterio** | HU-01 · CA-04 (bloqueo al 5.º intento fallido) |
| **Severidad / prioridad** | Crítica / Alta: permite ataques de fuerza bruta en paralelo sin límite |
| **Ambiente** | Backend CRMPyme (Node.js 24, Express 5, Sequelize 6, PostgreSQL/Neon) · k6 v2.3 |
| **Pasos para reproducir** | 1. Desbloquear la cuenta admin (intentos = 0). 2. Ejecutar `k6 run 05-concurrencia-bloqueo.js` (20 intentos fallidos simultáneos). 3. Consultar `intentos_fallidos` y `bloqueado_hasta` en la tabla `usuarios`. |
| **Resultado esperado** | Máximo 5 respuestas 401; el resto 423. La cuenta queda bloqueada. |
| **Resultado obtenido** | **20 respuestas 401** (umbral `respuestas_401: ['count<=5']` cruzado, k6 sale con código 99). En la BD: `intentos_fallidos = 1`, `bloqueado_hasta = NULL`. Reproducido 2 veces con el mismo resultado. |
| **Causa raíz** | Leer–modificar–escribir no atómico: `authService.js` hacía `findOne` (lee intentos = 0), calculaba `0 + 1` en JavaScript y guardaba con `update`. Con 20 peticiones simultáneas, las 20 leen 0 antes de que cualquiera guarde, todas calculan 1 y todas guardan 1: 19 actualizaciones se pierden (*lost update*). |
| **Por qué no lo detectaron las pruebas anteriores** | Las pruebas de Jest simulan la base de datos y ejecutan un intento a la vez; las E2E de Playwright también. Solo una prueba con concurrencia real podía encontrarlo. |
| **Estado** | Abierto → Corregido → Verificado (Paso 15: incremento atómico en la BD, Jest 4/4 y k6 con 5×401 + 15×423) |

## Evidencia (antes de la corrección)

```
$ k6 run 05-concurrencia-bloqueo.js
respuestas_401.................: 20     11.73/s
✗ 'count<=5'
thresholds on metrics 'respuestas_401' have been crossed
EXIT=99

$ node estado-cuenta.js
{ "intentos_fallidos": 1, "bloqueado_hasta": null }
```

Comparación con el comportamiento secuencial (Paso 12), que sí funciona:

```
Secuencial: 401 401 401 401 401 423 423
```
