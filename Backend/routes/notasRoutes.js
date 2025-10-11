// Importa Express y crea una instancia del enrutador
const express = require('express');
const router = express.Router();

// Importa el controlador que contiene la lógica de las notas
const notasController = require('../controllers/notasController');


// ==============================
// 📥 OBTENER NOTAS
// ==============================

/**
 * Ruta: GET /api/notas/:usuario_id
 * Descripción: Obtiene todas las notas del usuario
 */
router.get('/:usuario_id', notasController.obtenerNotas);

/**
 * Ruta: GET /api/notas/avances/:usuario_id
 * Descripción: Obtiene solo las notas de avances del usuario
 */
router.get('/avances/:usuario_id', notasController.obtenerNotasAvances);


// ==============================
// ✍️ CREAR Y MODIFICAR NOTAS
// ==============================

/**
 * Ruta: POST /api/notas
 * Descripción: Agrega una nueva nota
 * Body esperado: { usuario_id, plantilla_id }
 */
router.post('/', notasController.agregarNota);

/**
 * Ruta: PUT /api/notas/plantilla/:id
 * Descripción: Modifica una plantilla base existente por su ID
 */
router.put('/plantilla/:id', notasController.modificarPlantilla);


// ==============================
// 🧹 ELIMINAR O LIMPIAR NOTAS
// ==============================

/**
 * Ruta: DELETE /api/notas/:id
 * Descripción: Elimina completamente una nota (rompe la relación usuario ↔ plantilla)
 */
router.delete('/:id', notasController.eliminarNota);

/**
 * Ruta: PATCH /api/notas/limpiar-avances/:id
 * Descripción: Limpia solo el campo nota_avances (sin eliminar la fila)
 */
router.patch('/limpiar-avances/:id', notasController.limpiarNotaAvances);

/**
 * Ruta: DELETE /api/notas/plantilla/:id
 * Descripción: Elimina completamente una plantilla base
 */
router.delete('/plantilla/:id', notasController.eliminarPlantillaAdicional);


// Exporta el enrutador para ser usado en server.js
module.exports = router;
