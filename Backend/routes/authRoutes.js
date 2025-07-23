// Importa el módulo Express y crea una instancia de Router
const express = require("express");
const router = express.Router();

// Importa las funciones del controlador de autenticación
const {
  registrarUsuario,
  loginUsuario,
} = require("../controllers/authController");

/**
 * Ruta: POST /api/auth/registro
 * Descripción: Registra un nuevo usuario
 * Body esperado: { nombre, email, contraseña }
 * Controlador: registrarUsuario
 */
router.post("/registro", registrarUsuario);

/**
 * Ruta: POST /api/auth/login
 * Descripción: Inicia sesión de usuario
 * Body esperado: { email, contraseña }
 * Controlador: loginUsuario
 */
router.post("/login", loginUsuario);

// Exporta el router para ser usado en server.js
module.exports = router;
