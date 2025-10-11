// Importa la conexión a la base de datos PostgreSQL
const pool = require("../db");

// Importa uuidv4 para generar identificadores únicos
const { v4: uuidv4 } = require("uuid");

/**
 * 📄 Obtener todas las notas de un usuario
 * GET /api/notas/:usuario_id
 */
async function obtenerNotas(req, res) {
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
}

/**
 * 🧩 Obtener solo las notas de avances (no vacías) de un usuario
 * GET /api/notas/avances/:usuario_id
 */
async function obtenerNotasAvances(req, res) {
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
}

/**
 * ➕ Agregar una nueva nota (relación usuario ↔ plantilla)
 * POST /api/notas
 * Body: { usuario_id, plantilla_id }
 */
async function agregarNota(req, res) {
  const { usuario_id, plantilla_id } = req.body;

  // Validar que se proporcionen los datos necesarios
  if (!usuario_id || !plantilla_id) {
    return res.status(400).json({ 
      mensaje: "Se requieren usuario_id y plantilla_id" 
    });
  }

  try {
    // Verificar que el usuario existe
    const usuarioExiste = await pool.query(
      "SELECT id FROM usuarios WHERE id = $1", 
      [usuario_id]
    );
    
    if (usuarioExiste.rows.length === 0) {
      return res.status(404).json({ 
        mensaje: "Usuario no encontrado" 
      });
    }

    // Verificar que la plantilla base existe
    const plantillaExiste = await pool.query(
      "SELECT id FROM plantillas_base WHERE id = $1", 
      [plantilla_id]
    );
    
    if (plantillaExiste.rows.length === 0) {
      return res.status(404).json({ 
        mensaje: "Plantilla base no encontrada" 
      });
    }

    // Verificar que no existe ya la relación
    const relacionExiste = await pool.query(
      "SELECT id FROM notas_despacho_rel WHERE usuario_id = $1 AND plantilla_id = $2", 
      [usuario_id, plantilla_id]
    );
    
    if (relacionExiste.rows.length > 0) {
      return res.status(409).json({ 
        mensaje: "La nota ya está agregada para este usuario" 
      });
    }

    const id = uuidv4();

    await pool.query(
      `
      INSERT INTO notas_despacho_rel (id, usuario_id, plantilla_id, creado_en)
      VALUES ($1, $2, $3, NOW())
      `,
      [id, usuario_id, plantilla_id]
    );

    res.status(201).json({ 
      mensaje: "Nota agregada exitosamente",
      id: id
    });
  } catch (error) {
    console.error("❌ Error al agregar nota:", error);
    res.status(500).json({ 
      mensaje: "Error al agregar nota", 
      error: error.message 
    });
  }
}

/**
 * ✏️ Modificar el contenido de una plantilla base
 * PUT /api/notas/plantilla/:id
 * Body: { novedad, nota_publica, nota_interna, nota_avances, plantilla }
 */
async function modificarPlantilla(req, res) {
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
}

/**
 * 🗑️ Eliminar una nota (romper la relación usuario-plantilla)
 * DELETE /api/notas/:id
 */
async function eliminarNota(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ 
      mensaje: "Se requiere el ID de la nota" 
    });
  }

  try {
    // Verificar que la relación existe antes de eliminar
    const relacionExiste = await pool.query(
      "SELECT id FROM notas_despacho_rel WHERE id = $1", 
      [id]
    );
    
    if (relacionExiste.rows.length === 0) {
      return res.status(404).json({ 
        mensaje: "Nota no encontrada" 
      });
    }

    const result = await pool.query(
      "DELETE FROM notas_despacho_rel WHERE id = $1", 
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        mensaje: "No se pudo eliminar la nota" 
      });
    }

    res.json({ mensaje: "Nota eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar nota:", error);
    res.status(500).json({ 
      mensaje: "Error al eliminar nota", 
      error: error.message 
    });
  }
}

/**
 * 🧼 Limpiar solo el campo nota_avances de una plantilla base
 * PATCH /api/notas/limpiar-avances/:id
 */
async function limpiarNotaAvances(req, res) {
  const { id } = req.params;

  try {
    await pool.query("UPDATE plantillas_base SET nota_avances = NULL WHERE id = $1", [id]);
    res.json({ mensaje: "Nota de avances eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al limpiar nota de avances:", error);
    res.status(500).json({ mensaje: "Error al limpiar nota de avances", error });
  }
}

/**
 * 🚮 Eliminar completamente una plantilla base
 * DELETE /api/notas/plantilla/:id
 */
async function eliminarPlantillaAdicional(req, res) {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM plantillas_base WHERE id = $1", [id]);
    res.json({ mensaje: "Plantilla eliminada completamente" });
  } catch (error) {
    console.error("❌ Error al eliminar plantilla:", error);
    res.status(500).json({ mensaje: "Error al eliminar plantilla", error });
  }
}

/**
 * 📋 Obtener todas las plantillas base disponibles
 * GET /api/notas/plantillas-disponibles
 */
async function obtenerPlantillasDisponibles(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT 
        id,
        novedad,
        nota_publica,
        nota_interna,
        nota_avances,
        plantilla
      FROM plantillas_base
      ORDER BY novedad ASC
      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener plantillas disponibles:", error);
    res.status(500).json({ 
      mensaje: "Error al obtener plantillas disponibles", 
      error: error.message 
    });
  }
}

// ✅ Exportar funciones explícitamente
module.exports = {
  obtenerNotas,
  obtenerNotasAvances,
  agregarNota,
  modificarPlantilla,
  eliminarNota,
  limpiarNotaAvances,
  eliminarPlantillaAdicional,
  obtenerPlantillasDisponibles,
};
