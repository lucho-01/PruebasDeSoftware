# HU-01 — Pruebas del frontend · Matriz de trazabilidad y defectos

Proyecto: CRM-Pyme · Guía Semana 11 · Docente: Jesús Albeiro Zuluaga Duque

## 1. Criterios de aceptación de HU-01 (vista del usuario)

| ID | Criterio de aceptación |
|----|------------------------|
| CA-01 | Dado un usuario activo con credenciales correctas, cuando inicia sesión, entonces es redirigido al dashboard de su rol (administrador, gerente o vendedor). |
| CA-02 | Dado un inicio de sesión exitoso, entonces el token y los datos del usuario quedan guardados para mantener la sesión. |
| CA-03 | Dadas credenciales incorrectas, cuando intenta iniciar sesión, entonces ve el mensaje "Correo o contraseña incorrectos" y permanece en el login. |
| CA-04 | Dada una cuenta bloqueada por 5 intentos fallidos, entonces ve un mensaje con los minutos que debe esperar. |
| CA-05 | Dados campos vacíos, entonces ve el mensaje "Correo y contraseña son obligatorios". |
| CA-06 | Si el servidor no responde, el usuario ve un mensaje genérico y la aplicación no se rompe. |

## 2. Partición de equivalencia

| Clase | Tipo | Representante | Respuesta esperada |
|-------|------|---------------|--------------------|
| Credenciales correctas · rol administrador | Válida | admin@crm.local / Admin123 | 200 → /dashboard/admin |
| Credenciales correctas · rol gerente / vendedor | Válida | usuario de cada rol | 200 → dashboard de su rol |
| Credenciales correctas · rol no mapeado | Inválida (borde) | rol "auditor" | Se queda en / |
| Contraseña incorrecta | Inválida | admin@crm.local / claveMala | 401 CREDENCIALES_INVALIDAS |
| Cuenta bloqueada | Inválida | 6.º intento seguido | 423 CUENTA_BLOQUEADA |
| Campos vacíos | Inválida | "" / "" | 400 DATOS_FALTANTES |
| Correo con formato inválido | Inválida | esto-no-es-un-correo | El navegador bloquea el envío |
| Servidor caído | Inválida (entorno) | sin respuesta HTTP | Mensaje genérico |

## 3. Matriz de trazabilidad

| Caso | Nivel | Descripción | Criterio | Archivo | Estado |
|------|-------|-------------|----------|---------|--------|
| CP-U01 a CP-U03 | Unitaria | authApi.login envía el cuerpo correcto, devuelve data y propaga errores | CA-01, CA-03 | `src/api/authApi.test.js` | Verde |
| CP-U04 a CP-U06 | Unitaria | AuthProvider guarda y recupera la sesión de localStorage | CA-02 | `src/context/AuthContext.test.jsx` | Verde |
| CP-01, CP-02 | Componente | El formulario se dibuja y los campos reciben lo que se escribe | Base de todos | `src/features/auth/LoginPage.test.jsx` | Verde |
| CP-03, CP-04 | Componente | Envía lo escrito y redirige según el rol (3 roles) | CA-01 | `src/features/auth/LoginPage.test.jsx` | Verde |
| CP-05 | Componente | Guarda token y usuario en localStorage | CA-02 | `src/features/auth/LoginPage.test.jsx` | Verde |
| CP-06 | Componente | Rol desconocido: se queda en el login | CA-01 (borde) | `src/features/auth/LoginPage.test.jsx` | Verde |
| CP-07 | Componente | Sin respuesta del servidor: mensaje genérico | CA-06 | `src/features/auth/LoginPage.test.jsx` | Verde |
| CP-08 | Componente | 401: muestra "Correo o contraseña incorrectos" | CA-03 | `src/features/auth/LoginPage.test.jsx` | Verde |
| CP-09 | Componente | 423: muestra el mensaje de cuenta bloqueada | CA-04 | `src/features/auth/LoginPage.test.jsx` | Verde |
| CP-10 | Componente | Campos vacíos: muestra el mensaje de obligatorios | CA-05 | `src/features/auth/LoginPage.test.jsx` | Verde |
| CP-11 | Componente | El mensaje de error anterior desaparece al iniciar sesión con éxito (actividad 5.3) | CA-03 (regresión) | `src/features/auth/LoginPage.test.jsx` | Verde |
| CP-12 | Componente | El doble clic en Login no envía dos peticiones al backend (actividad 5.3) | Mejora DEF-002 | `src/features/auth/LoginPage.test.jsx` | Verde |
| E2E-01 a E2E-03 | E2E | Flujo real en Chromium: éxito, error y correo inválido | CA-01, CA-02, CA-03 | `e2e/login.spec.js` | Verde |

Resumen: **20 pruebas unitarias/de componente (Vitest + Testing Library) y 3 E2E (Playwright)**, cobertura 100 % en `authApi.js`, `AuthContext.jsx`, `useAuth.js` y `LoginPage.jsx`. CP-11 y CP-12 son casos añadidos por la actividad 5.3 de la guía. Ninguna prueba depende del backend real ni de la base de datos: los mocks copian el formato de `apiResponse.js` (`{ success, data }` / `{ success, error: { code, message } }`).

## 4. Reporte de defectos

### DEF-001 — La aplicación queda en blanco al ingresar credenciales incorrectas

| Campo | Detalle |
|-------|---------|
| ID | DEF-001 |
| Título | La aplicación queda en blanco al ingresar credenciales incorrectas |
| Historia / criterio | HU-01 · CA-03, CA-04, CA-05 |
| Severidad / prioridad | Alta / Alta (bloquea un flujo principal y no hay mensaje para el usuario) |
| Ambiente | Frontend React 19 + Vite, Chrome · detectado por CP-08 y CP-09 |
| Pasos para reproducir | 1. Abrir http://localhost:5173 2. Correo: admin@crm.local · Contraseña: claveMala 3. Clic en "Login" |
| Resultado esperado | Se muestra "Correo o contraseña incorrectos" debajo del formulario. |
| Resultado obtenido | La página queda en blanco. Consola: "Objects are not valid as a React child (found: object with keys {code, message})". |
| Causa raíz | `LoginPage.jsx` guarda en el estado el objeto error completo en lugar de `error.message`. |
| Corrección | `setMensaje(error.response?.data?.error?.message \|\| 'Error al iniciar sesión')` |
| Estado | Abierto → Corregido → **Verificado** (CP-08, CP-09, CP-10 y E2E-02 en verde; regresión 18/18) |

Clasificación (vocabulario semana 1): el error humano fue suponer que `error` era un texto; el defecto es la línea del `catch`; la falla es la pantalla en blanco que ve el usuario. Es un defecto de integración: el backend y el frontend eran correctos por separado, pero estandarizar `apiResponse.js` cambió el formato sin re-probar el caso de error.

### DEF-002 — El botón Login permite enviar el formulario dos veces con doble clic

| Campo | Detalle |
|-------|---------|
| ID | DEF-002 |
| Título | El botón Login permite enviar el formulario dos veces con doble clic |
| Historia / criterio | HU-01 · mejora detectada por la actividad 5.3 (caso CP-12) |
| Severidad / prioridad | Media / Media (no bloquea, pero duplica la petición y el guardado de sesión) |
| Ambiente | Frontend React 19 + Vite, jsdom · detectado por CP-12 |
| Pasos para reproducir | 1. Abrir http://localhost:5173 2. Llenar correo y contraseña 3. Hacer doble clic rápido en "Login" |
| Resultado esperado | Se envía una sola petición al backend. |
| Resultado obtenido | Se envían dos peticiones `/auth/login` con los mismos datos. |
| Causa raíz | `LoginPage.jsx` no tenía estado de "envío en curso"; el botón permanecía activo mientras la petición estaba pendiente. |
| Corrección | Estado `enviando`: el botón se deshabilita (`disabled={enviando}`) al enviar y se rehabilita en el `catch` si el login falla. |
| Estado | Abierto → Corregido → **Verificado** (CP-12 en verde; regresión 20/20) |
