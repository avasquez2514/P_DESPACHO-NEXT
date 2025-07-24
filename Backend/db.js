const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL + "?sslmode=require",
  ssl: {
    rejectUnauthorized: false,
  },
  // ⚠️ Agrega explícitamente el host IPv4 para evitar IPv6
  host: "db.uwkqbjvuuiudbinvwvnf.supabase.co", // este es tu host de Supabase
});

module.exports = pool;
