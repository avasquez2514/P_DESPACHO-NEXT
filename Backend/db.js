const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log("✅ Conexión exitosa a Supabase"))
  .catch(err => console.error("❌ Error de conexión a Supabase:", err.message));

module.exports = pool;
