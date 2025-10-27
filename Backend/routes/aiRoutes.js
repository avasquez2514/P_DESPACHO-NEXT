const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Ruta para mejorar texto con IA
router.post('/mejorar-texto', aiController.mejorarTexto);

// Ruta alternativa gratuita para mejorar texto
router.post('/mejorar-texto-gratuito', aiController.mejorarTextoGratuito);

// Ruta para obtener sinónimos
router.get('/sinonimos', aiController.obtenerSinonimos);

module.exports = router;

