// Desbloquea la cuenta admin tras una prueba (Paso 12 de la guía k6)
const { Client } = require("pg");
require("dotenv").config({ path: __dirname + "/../Backend/.env" });

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const r = await c.query(
    "UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE correo = $1 RETURNING correo, intentos_fallidos, bloqueado_hasta",
    ["admin@crm.local"],
  );
  console.log("Desbloqueada:", JSON.stringify(r.rows[0]));
  await c.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
