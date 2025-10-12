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
 * ➕ Agregar una nueva nota personalizada (crea nueva plantilla base para el usuario)
 * POST /api/notas
 * Body: { usuario_id, novedad, nota_publica, nota_interna, nota_avances, plantilla }
 */
async function agregarNota(req, res) {
  const { usuario_id, novedad, nota_publica, nota_interna, nota_avances, plantilla } = req.body;

  // Validar que se proporcionen los datos necesarios
  if (!usuario_id || !novedad) {
    return res.status(400).json({ 
      mensaje: "Se requieren usuario_id y novedad como mínimo" 
    });
  }

  // 🚫 Validar que no se usen nombres incorrectos
  const nombresIncorrectos = ['AVANCE', 'avance', 'Avance'];
  if (nombresIncorrectos.includes(novedad.toUpperCase())) {
    return res.status(400).json({ 
      mensaje: "El nombre 'AVANCE' no es válido para una plantilla base. Use un nombre descriptivo como 'Reporte de Avances' o 'Seguimiento de Proyecto'",
      sugerencias: [
        "Reporte de Avances",
        "Seguimiento de Proyecto", 
        "Actualización de Estado",
        "Progreso de Tarea",
        "Estado de Actividades"
      ]
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

    // Crear una nueva plantilla base personalizada
    const plantillaId = uuidv4();
    await pool.query(
      `
      INSERT INTO plantillas_base (id, novedad, nota_publica, nota_interna, nota_avances, plantilla)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        plantillaId, 
        novedad, 
        nota_publica || '', 
        nota_interna || '', 
        nota_avances || '', 
        plantilla || ''
      ]
    );

    // Crear la relación usuario-plantilla
    const relacionId = uuidv4();
    await pool.query(
      `
      INSERT INTO notas_despacho_rel (id, usuario_id, plantilla_id, creado_en)
      VALUES ($1, $2, $3, NOW())
      `,
      [relacionId, usuario_id, plantillaId]
    );

    res.status(201).json({ 
      mensaje: "Nota personalizada creada exitosamente",
      id: relacionId,
      plantilla_id: plantillaId
    });
  } catch (error) {
    console.error("❌ Error al agregar nota personalizada:", error);
    res.status(500).json({ 
      mensaje: "Error al agregar nota personalizada", 
      error: error.message 
    });
  }
}

/**
 * ➕ Agregar una nota existente (asignar plantilla base a usuario)
 * POST /api/notas/asignar
 * Body: { usuario_id, plantilla_id }
 */
async function asignarNota(req, res) {
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
      mensaje: "Nota asignada exitosamente",
      id: id
    });
  } catch (error) {
    console.error("❌ Error al asignar nota:", error);
    res.status(500).json({ 
      mensaje: "Error al asignar nota", 
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
 * 🗑️ Eliminar una nota (romper la relación usuario-plantilla y eliminar plantilla personalizada si es necesario)
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
    // Primero obtener información de la relación para saber si es plantilla personalizada
    const relacionInfo = await pool.query(
      `
      SELECT 
        ndr.id as relacion_id,
        ndr.usuario_id,
        ndr.plantilla_id,
        pb.novedad,
        COUNT(ndr2.id) as total_usuarios_con_esta_plantilla
      FROM notas_despacho_rel ndr
      INNER JOIN plantillas_base pb ON ndr.plantilla_id = pb.id
      LEFT JOIN notas_despacho_rel ndr2 ON pb.id = ndr2.plantilla_id
      WHERE ndr.id = $1
      GROUP BY ndr.id, ndr.usuario_id, ndr.plantilla_id, pb.novedad
      `, 
      [id]
    );
    
    if (relacionInfo.rows.length === 0) {
      return res.status(404).json({ 
        mensaje: "Nota no encontrada" 
      });
    }

    const info = relacionInfo.rows[0];
    const esPlantillaPersonalizada = info.total_usuarios_con_esta_plantilla === 1;

    // Eliminar la relación usuario-plantilla
    const resultRelacion = await pool.query(
      "DELETE FROM notas_despacho_rel WHERE id = $1", 
      [id]
    );

    if (resultRelacion.rowCount === 0) {
      return res.status(404).json({ 
        mensaje: "No se pudo eliminar la relación de la nota" 
      });
    }

    // Si es una plantilla personalizada (solo la usa este usuario), eliminar también la plantilla base
    if (esPlantillaPersonalizada) {
      await pool.query(
        "DELETE FROM plantillas_base WHERE id = $1", 
        [info.plantilla_id]
      );
      console.log(`✅ Plantilla personalizada "${info.novedad}" eliminada completamente`);
    }

    res.json({ 
      mensaje: "Nota eliminada correctamente",
      plantilla_eliminada: esPlantillaPersonalizada,
      plantilla_nombre: info.novedad
    });
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
      WHERE UPPER(novedad) NOT IN ('AVANCE', 'avance', 'Avance')
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

/**
 * 🧹 Limpiar plantillas con nombres incorrectos (como "AVANCE")
 * DELETE /api/notas/limpiar-plantillas-incorrectas
 */
async function limpiarPlantillasIncorrectas(req, res) {
  try {
    // Buscar plantillas con nombres incorrectos
    const plantillasIncorrectas = await pool.query(
      `
      SELECT 
        pb.id,
        pb.novedad,
        COUNT(ndr.id) as total_usuarios
      FROM plantillas_base pb
      LEFT JOIN notas_despacho_rel ndr ON pb.id = ndr.plantilla_id
      WHERE UPPER(pb.novedad) IN ('AVANCE', 'avance', 'Avance')
      GROUP BY pb.id, pb.novedad
      `
    );

    if (plantillasIncorrectas.rows.length === 0) {
      return res.json({ 
        mensaje: "No hay plantillas con nombres incorrectos",
        plantillas_eliminadas: 0
      });
    }

    let plantillasEliminadas = 0;

    // Eliminar cada plantilla incorrecta
    for (const plantilla of plantillasIncorrectas.rows) {
      // Primero eliminar las relaciones
      await pool.query(
        "DELETE FROM notas_despacho_rel WHERE plantilla_id = $1",
        [plantilla.id]
      );

      // Luego eliminar la plantilla
      await pool.query(
        "DELETE FROM plantillas_base WHERE id = $1",
        [plantilla.id]
      );

      plantillasEliminadas++;
      console.log(`✅ Plantilla incorrecta "${plantilla.novedad}" eliminada (${plantilla.total_usuarios} usuarios afectados)`);
    }

    res.json({ 
      mensaje: `Se eliminaron ${plantillasEliminadas} plantillas con nombres incorrectos`,
      plantillas_eliminadas: plantillasEliminadas,
      detalles: plantillasIncorrectas.rows.map(p => ({
        nombre: p.novedad,
        usuarios_afectados: p.total_usuarios
      }))
    });
  } catch (error) {
    console.error("❌ Error al limpiar plantillas incorrectas:", error);
    res.status(500).json({ 
      mensaje: "Error al limpiar plantillas incorrectas", 
      error: error.message 
    });
  }
}

// ✅ Exportar funciones explícitamente
module.exports = {
  obtenerNotas,
  obtenerNotasAvances,
  agregarNota,
  asignarNota,
  modificarPlantilla,
  eliminarNota,
  limpiarNotaAvances,
  eliminarPlantillaAdicional,
  obtenerPlantillasDisponibles,
  limpiarPlantillasIncorrectas,
};
