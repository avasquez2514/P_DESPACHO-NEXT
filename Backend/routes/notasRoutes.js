// Importa Express y crea una instancia del enrutador
const express = require('express');
const router = express.Router();

// Importa el controlador que contiene la lógica de las notas
const notasController = require('../controllers/notasController');

// 📥 OBTENER NOTAS

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


// ✍️ CREAR Y MODIFICAR NOTAS

/**
 * Ruta: POST /api/notas
 * Descripción: Agrega una nueva nota
 * Body esperado: { usuario_id, novedad, nota_publica, nota_interna, nota_avances, plantilla }
 */
router.post('/', notasController.agregarNota);

/**
 * Ruta: PUT /api/notas/:id
 * Descripción: Modifica una nota existente por su ID
 */
router.put('/:id', notasController.modificarNota);


// 🧹 ELIMINAR O LIMPIAR NOTAS

/**
 * Ruta: DELETE /api/notas/:id
 * Descripción: Elimina completamente una nota por su ID
 */
router.delete('/:id', notasController.eliminarNota);

/**
 * Ruta: DELETE /api/notas/avances/:id
 * Descripción: Limpia solo el campo nota_avances (sin eliminar la fila)
 */
router.delete('/avances/:id', notasController.limpiarNotaAvances);

/**
 * Ruta: DELETE /api/notas/plantilla/:id
 * Descripción: Elimina completamente una plantilla adicional (nueva función)
 */
router.delete('/plantilla/:id', notasController.eliminarPlantillaAdicional);

// Exporta el enrutador para ser usado en server.js
module.exports = router;
