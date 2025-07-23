// Importa la conexión a la base de datos PostgreSQL
const pool = require('../db');

// Importa uuidv4 para generar identificadores únicos
const { v4: uuidv4 } = require('uuid');

/**
 * Obtener todas las notas de un usuario
 * Método: GET
 * Ruta: /api/notas/:usuario_id
 */
exports.obtenerNotas = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM notas_despacho WHERE usuario_id = $1',
      [usuario_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las notas', error });
  }
};

/**
 * Obtener solo las notas de avances (no vacías) de un usuario
 * Método: GET
 * Ruta: /api/notas/avances/:usuario_id
 */
exports.obtenerNotasAvances = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM notas_despacho
       WHERE usuario_id = $1
       AND nota_avances IS NOT NULL
       AND TRIM(nota_avances) != ''`,
      [usuario_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener notas de avances:', error);
    res.status(500).json({ mensaje: 'Error al obtener notas de avances', error });
  }
};

/**
 * Agregar una nueva nota al usuario
 * Método: POST
 * Ruta: /api/notas
 * Body esperado: { usuario_id, novedad, nota_publica, nota_interna, nota_avances, plantilla }
 */
exports.agregarNota = async (req, res) => {
  const { usuario_id, novedad, nota_publica, nota_interna, nota_avances, plantilla } = req.body;

  try {
    const id = uuidv4(); // Genera ID único
    await pool.query(
      `INSERT INTO notas_despacho (id, usuario_id, novedad, nota_publica, nota_interna, nota_avances, plantilla)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, usuario_id, novedad, nota_publica, nota_interna, nota_avances, plantilla]
    );
    res.status(201).json({ mensaje: 'Nota agregada exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al agregar nota', error });
  }
};

/**
 * Modificar una nota existente por su ID
 * Método: PUT
 * Ruta: /api/notas/:id
 * Body esperado: { novedad, nota_publica, nota_interna, nota_avances, plantilla }
 */
exports.modificarNota = async (req, res) => {
  const { id } = req.params;
  const { novedad, nota_publica, nota_interna, nota_avances, plantilla } = req.body;

  try {
    await pool.query(
      `UPDATE notas_despacho
       SET novedad = $1, nota_publica = $2, nota_interna = $3, nota_avances = $4, plantilla = $5
       WHERE id = $6`,
      [novedad, nota_publica, nota_interna, nota_avances, plantilla, id]
    );
    res.json({ mensaje: 'Nota actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al modificar nota', error });
  }
};

/**
 * Eliminar una nota completamente por su ID
 * Método: DELETE
 * Ruta: /api/notas/:id
 */
exports.eliminarNota = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM notas_despacho WHERE id = $1', [id]);
    res.json({ mensaje: 'Nota eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar nota', error });
  }
};

/**
 * Vaciar solo el campo nota_avances de una nota (no borra la fila)
 * Método: PATCH
 * Ruta: /api/notas/limpiar-avances/:id
 */
exports.limpiarNotaAvances = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      'UPDATE notas_despacho SET nota_avances = NULL WHERE id = $1',
      [id]
    );
    res.json({ mensaje: 'Nota de avances eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al limpiar nota de avances', error });
  }
};

/**
 * Eliminar completamente una fila de una plantilla adicional
 * Método: DELETE
 * Ruta: /api/notas/plantilla/:id
 */
exports.eliminarPlantillaAdicional = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM notas_despacho WHERE id = $1', [id]);
    res.json({ mensaje: 'Plantilla eliminada completamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar plantilla', error });
  }
};
