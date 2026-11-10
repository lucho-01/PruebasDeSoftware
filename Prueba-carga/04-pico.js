import http from "k6/http";
import { check, sleep } from "k6";
const BASE_URL = "http://localhost:3000";
// Simula el inicio de la jornada: todos los vendedores entran al tiempo a las 8:00 a. m.
export const options = {
  stages: [
    { duration: "20s", target: 5 }, // carga normal
    { duration: "10s", target: 80 }, // pico repentino
    { duration: "40s", target: 80 }, // el pico se mantiene
    { duration: "10s", target: 5 }, // vuelve a la normalidad
    { duration: "40s", target: 5 }, // ¿se recupera el sistema?
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    "http_req_duration{endpoint:login}": ["p(95)<2000"],
  },
};
export default function () {
  const login = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ correo: "admin@crm.local", password: "Admin123" }),
    {
      headers: { "Content-Type": "application/json" },
      tags: { endpoint: "login" },
      timeout: "10s",
    },
  );
  check(login, { "status 200": (r) => r.status === 200 });
  sleep(1);
}
