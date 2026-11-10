import http from "k6/http";
import { check, sleep } from "k6";
const BASE_URL = "http://localhost:3000";
export const options = {
  stages: [
    { duration: "30s", target: 25 },
    { duration: "30s", target: 50 },
    { duration: "30s", target: 100 },
    { duration: "30s", target: 150 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    "http_req_duration{endpoint:login}": ["p(95)<800"],
    checks: ["rate>0.99"],
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
