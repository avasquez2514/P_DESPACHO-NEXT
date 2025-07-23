// Importa el Pool de conexiones del módulo 'pg' (PostgreSQL)
const { Pool } = require('pg');

// Carga las variables de entorno desde el archivo .env
require('dotenv').config(); // ← Necesario para acceder a DB_USER, DB_PASSWORD, etc.

/**
 * Crea una nueva instancia de Pool para manejar la conexión con PostgreSQL
 * El Pool permite múltiples conexiones simultáneas, ideal para entornos con muchas solicitudes
 */
const pool = new Pool({
  user: process.env.DB_USER,         // Usuario de la base de datos (ej: 'postgres')
  host: process.env.DB_HOST,         // Host de la base de datos (ej: 'localhost')
  database: process.env.DB_NAME,     // Nombre de la base de datos
  password: process.env.DB_PASSWORD, // Contraseña del usuario
  port: process.env.DB_PORT,         // Puerto de conexión (por defecto 5432 en PostgreSQL)
});

// Exporta el pool para que pueda ser reutilizado en cualquier archivo (consultas, rutas, etc.)
module.exports = pool;
