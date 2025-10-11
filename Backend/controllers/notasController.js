// Importa la conexión a la base de datos PostgreSQL
const pool = require("../db");

// Importa uuidv4 para generar identificadores únicos
const { v4: uuidv4 } = require("uuid");

/**
 * 📄 Obtener todas las notas de un usuario
 * GET /api/notas/:usuario_id
 */
exports.obtenerNotas = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        ndr.id,
        pb.novedad,
        pb.nota_publica,
        pb.nota_interna,
        pb.nota_avances,
        pb.plantilla,
        ndr.creado_en
      FROM notas_despacho_rel ndr
      INNER JOIN plantillas_base pb ON ndr.plantilla_id = pb.id
      WHERE ndr.usuario_id = $1
      ORDER BY ndr.creado_en DESC
      `,
      [usuario_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener las notas:", error);
    res.status(500).json({ mensaje: "Error al obtener las notas", error });
  }
};

/**
 * 🧩 Obtener solo las notas de avances (no vacías) de un usuario
 * GET /api/notas/avances/:usuario_id
 */
exports.obtenerNotasAvances = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        ndr.id,
        pb.novedad,
        pb.nota_avances,
        ndr.creado_en
      FROM notas_despacho_rel ndr
      INNER JOIN plantillas_base pb ON ndr.plantilla_id = pb.id
      WHERE ndr.usuario_id = $1
      AND pb.nota_avances IS NOT NULL
      AND TRIM(pb.nota_avances) != ''
      ORDER BY ndr.creado_en DESC
      `,
      [usuario_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener notas de avances:", error);
    res.status(500).json({ mensaje: "Error al obtener notas de avances", error });
  }
};

/**
 * ➕ Agregar una nueva nota (relación usuario ↔ plantilla)
 * POST /api/notas
 * Body: { usuario_id, plantilla_id }
 */
exports.agregarNota = async (req, res) => {
  const { usuario_id, plantilla_id } = req.body;

  try {
    const id = uuidv4();

    await pool.query(
      `
      INSERT INTO notas_despacho_rel (id, usuario_id, plantilla_id, creado_en)
      VALUES ($1, $2, $3, NOW())
      `,
      [id, usuario_id, plantilla_id]
    );

    res.status(201).json({ mensaje: "Nota agregada exitosamente" });
  } catch (error) {
    console.error("❌ Error al agregar nota:", error);
    res.status(500).json({ mensaje: "Error al agregar nota", error });
  }
};

/**
 * ✏️ Modificar el contenido de una plantilla base
 * PUT /api/notas/plantilla/:id
 * Body: { novedad, nota_publica, nota_interna, nota_avances, plantilla }
 */
exports.modificarPlantilla = async (req, res) => {
  const { id } = req.params;
  const { novedad, nota_publica, nota_interna, nota_avances, plantilla } = req.body;

  try {
    await pool.query(
      `
      UPDATE plantillas_base
      SET novedad = $1, nota_publica = $2, nota_interna = $3, nota_avances = $4, plantilla = $5
      WHERE id = $6
      `,
      [novedad, nota_publica, nota_interna, nota_avances, plantilla, id]
    );

    res.json({ mensaje: "Plantilla actualizada correctamente" });
  } catch (error) {
    console.error("❌ Error al modificar plantilla:", error);
    res.status(500).json({ mensaje: "Error al modificar plantilla", error });
  }
};

/**
 * 🗑️ Eliminar una nota (romper la relación usuario-plantilla)
 * DELETE /api/notas/:id
 */
exports.eliminarNota = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM notas_despacho_rel WHERE id = $1", [id]);
    res.json({ mensaje: "Nota eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar nota:", error);
    res.status(500).json({ mensaje: "Error al eliminar nota", error });
  }
};

/**
 * 🧼 Limpiar solo el campo nota_avances de una plantilla base
 * PATCH /api/notas/limpiar-avances/:id
 */
exports.limpiarNotaAvances = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("UPDATE plantillas_base SET nota_avances = NULL WHERE id = $1", [id]);
    res.json({ mensaje: "Nota de avances eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al limpiar nota de avances:", error);
    res.status(500).json({ mensaje: "Error al limpiar nota de avances", error });
  }
};

/**
 * 🚮 Eliminar completamente una plantilla base
 * DELETE /api/notas/plantilla/:id
 */
exports.eliminarPlantillaAdicional = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM plantillas_base WHERE id = $1", [id]);
    res.json({ mensaje: "Plantilla eliminada completamente" });
  } catch (error) {
    console.error("❌ Error al eliminar plantilla:", error);
    res.status(500).json({ mensaje: "Error al eliminar plantilla", error });
  }
};
