import http from "k6/http";
import { check, sleep } from "k6";
const BASE_URL = "http://localhost:3000";
export const options = {
  vus: 1,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
    checks: ["rate>0.99"],
  },
};
export default function () {
  const ping = http.get(`${BASE_URL}/ping`);
  check(ping, {
    "ping: status 200": (r) => r.status === 200,
    "ping: responde pong": (r) => r.body === "pong",
  });
  const login = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ correo: "admin@crm.local", password: "Admin123" }),
    { headers: { "Content-Type": "application/json" } },
  );
  check(login, {
    "login: status 200": (r) => r.status === 200,
    "login: devuelve token": (r) => r.json("data.token") !== undefined,
  });
  sleep(1);
}
