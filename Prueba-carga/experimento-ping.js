import http from "k6/http";
import { sleep } from "k6";
export const options = {
  stages: [
    { duration: "20s", target: 150 },
    { duration: "30s", target: 150 },
  ],
};
export default function () {
  http.get("http://localhost:3000/ping");
  sleep(1);
}
