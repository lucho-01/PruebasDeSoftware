// Consulta rápida del estado de la cuenta admin (Fase 6 - k6)
const { Client } = require("pg");
require("dotenv").config({ path: __dirname + "/../Backend/.env" });

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const r = await c.query(
    "SELECT correo, intentos_fallidos, bloqueado_hasta FROM usuarios WHERE correo = $1",
    ["admin@crm.local"],
  );
  console.log(JSON.stringify(r.rows[0], null, 2));
  await c.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
