import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

const BASE_URL = 'http://localhost:3000';
const respuestas401 = new Counter('respuestas_401');
const respuestas423 = new Counter('respuestas_423');

// 20 usuarios virtuales envían UNA contraseña incorrecta casi al mismo tiempo
export const options = {
  scenarios: {
    rafaga: {
      executor: 'per-vu-iterations',
      vus: 20,
      iterations: 1,
    },
  },
  thresholds: {
    // HU-01: la cuenta se bloquea al 5.º intento fallido → como máximo 5 respuestas 401
    respuestas_401: ['count<=5'],
  },
};

export default function () {
  const r = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ correo: 'admin@crm.local', password: 'claveIncorrecta' }),
    { headers: { 'Content-Type': 'application/json' }, responseCallback: http.expectedStatuses(401, 423) }
  );
  if (r.status === 401) respuestas401.add(1);
  if (r.status === 423) respuestas423.add(1);
  check(r, { 'responde 401 o 423': (res) => res.status === 401 || res.status === 423 });
}
