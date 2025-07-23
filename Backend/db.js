const { Pool } = require('pg');

// Si estás usando Render, usa directamente DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Necesario para conexiones externas con Supabase
  },
});

module.exports = pool;
