// ✅ Rutas de Aplicativos

const express = require("express");
const router = express.Router();

// Importa los controladores
const {
  obtenerAplicativos,
  agregarAplicativo,
  eliminarAplicativo,
} = require("../controllers/aplicativosController");

/**
 * Ruta: GET /api/aplicativos?usuario_id=xxx
 * Descripción: Obtiene todos los aplicativos del usuario según su ID
 */
router.get("/", obtenerAplicativos);

/**
 * Ruta: POST /api/aplicativos
 * Descripción: Agrega un nuevo aplicativo al usuario
 * Body esperado: { usuario_id, aplicativo_base_id }
 */
router.post("/", agregarAplicativo);

/**
 * Ruta: DELETE /api/aplicativos/:id
 * Descripción: Elimina un aplicativo específico por su ID
 */
router.delete("/:id", eliminarAplicativo);

// Exporta el enrutador para ser usado en server.js
module.exports = router;
