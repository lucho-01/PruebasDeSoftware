const { Client } = require("pg");
require("dotenv").config({ path: __dirname + "/../Backend/.env" });
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const r = await c.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'usuarios' ORDER BY ordinal_position",
  );
  console.log(r.rows.map((x) => x.column_name).join(", "));
  await c.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
