// ✅ Controlador de Aplicativos Normalizado

// Importa la conexión a la base de datos PostgreSQL
const pool = require("../db");

// Importa la función uuidv4 del paquete 'uuid' para generar identificadores únicos
const { v4: uuidv4 } = require("uuid");

/**
 * Obtener todos los aplicativos de un usuario
 * Método: GET
 * Ruta: /api/aplicativos?usuario_id=ID
 */
const obtenerAplicativos = async (req, res) => {
  const { usuario_id } = req.query; // Extrae el ID del usuario desde la consulta

  try {
    // 🔹 Consulta los aplicativos asociados a un usuario usando la tabla relacional
    const resultado = await pool.query(
      `
      SELECT 
        ar.id,
        ab.nombre,
        ab.url,
        ab.categoria,
        ar.creado_en
      FROM aplicativos_rel ar
      INNER JOIN aplicativos_base ab ON ar.aplicativo_base_id = ab.id
      WHERE ar.usuario_id = $1
      ORDER BY ar.creado_en DESC
      `,
      [usuario_id]
    );

    // Devuelve los aplicativos vinculados al usuario
    res.json(resultado.rows);
  } catch (error) {
    console.error("❌ Error al obtener aplicativos:", error);
    res.status(500).json({ mensaje: "Error al obtener aplicativos" });
  }
};

/**
 * Agregar un nuevo aplicativo personalizado (crea nueva plantilla base para el usuario)
 * Método: POST
 * Ruta: /api/aplicativos
 * Body esperado: { usuario_id, nombre, url, categoria }
 */
const agregarAplicativo = async (req, res) => {
  const { usuario_id, nombre, url, categoria } = req.body;

  // Validar que se proporcionen los datos necesarios
  if (!usuario_id || !nombre) {
    return res.status(400).json({ 
      mensaje: "Se requieren usuario_id y nombre como mínimo" 
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
    const aplicativoId = uuidv4();
    await pool.query(
      `
      INSERT INTO aplicativos_base (id, nombre, url, categoria)
      VALUES ($1, $2, $3, $4)
      `,
      [aplicativoId, nombre, url || '', categoria || 'Personalizado']
    );

    // Crear la relación usuario-aplicativo
    const relacionId = uuidv4();
    await pool.query(
      `
      INSERT INTO aplicativos_rel (id, usuario_id, aplicativo_base_id, creado_en)
      VALUES ($1, $2, $3, NOW())
      `,
      [relacionId, usuario_id, aplicativoId]
    );

    res.status(201).json({ 
      mensaje: "Aplicativo personalizado creado exitosamente",
      id: relacionId,
      aplicativo_base_id: aplicativoId
    });
  } catch (error) {
    console.error("❌ Error al agregar aplicativo personalizado:", error);
    res.status(500).json({ 
      mensaje: "Error al agregar aplicativo personalizado", 
      error: error.message 
    });
  }
};

/**
 * Agregar un aplicativo existente (asignar aplicativo base a usuario)
 * Método: POST
 * Ruta: /api/aplicativos/asignar
 * Body esperado: { usuario_id, aplicativo_base_id }
 */
const asignarAplicativo = async (req, res) => {
  const { usuario_id, aplicativo_base_id } = req.body;

  // Validar que se proporcionen los datos necesarios
  if (!usuario_id || !aplicativo_base_id) {
    return res.status(400).json({ 
      mensaje: "Se requieren usuario_id y aplicativo_base_id" 
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

    // Verificar que el aplicativo base existe
    const aplicativoExiste = await pool.query(
      "SELECT id FROM aplicativos_base WHERE id = $1", 
      [aplicativo_base_id]
    );
    
    if (aplicativoExiste.rows.length === 0) {
      return res.status(404).json({ 
        mensaje: "Aplicativo base no encontrado" 
      });
    }

    // Verificar que no existe ya la relación
    const relacionExiste = await pool.query(
      "SELECT id FROM aplicativos_rel WHERE usuario_id = $1 AND aplicativo_base_id = $2", 
      [usuario_id, aplicativo_base_id]
    );
    
    if (relacionExiste.rows.length > 0) {
      return res.status(409).json({ 
        mensaje: "El aplicativo ya está agregado para este usuario" 
      });
    }

    const id = uuidv4();

    // 🔹 Inserta la relación usuario-aplicativo en la tabla relacional
    await pool.query(
      `
      INSERT INTO aplicativos_rel (id, usuario_id, aplicativo_base_id, creado_en)
      VALUES ($1, $2, $3, NOW())
      `,
      [id, usuario_id, aplicativo_base_id]
    );

    res.status(201).json({ 
      mensaje: "Aplicativo asignado exitosamente",
      id: id
    });
  } catch (error) {
    console.error("❌ Error al asignar aplicativo:", error);
    res.status(500).json({ 
      mensaje: "Error al asignar aplicativo", 
      error: error.message 
    });
  }
};

/**
 * Eliminar un aplicativo de un usuario (eliminar relación y aplicativo personalizado si es necesario)
 * Método: DELETE
 * Ruta: /api/aplicativos/:id
 * (id = id de aplicativos_rel)
 */
const eliminarAplicativo = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ 
      mensaje: "Se requiere el ID del aplicativo" 
    });
  }

  try {
    // Primero obtener información de la relación para saber si es aplicativo personalizado
    const relacionInfo = await pool.query(
      `
      SELECT 
        ar.id as relacion_id,
        ar.usuario_id,
        ar.aplicativo_base_id,
        ab.nombre,
        COUNT(ar2.id) as total_usuarios_con_este_aplicativo
      FROM aplicativos_rel ar
      INNER JOIN aplicativos_base ab ON ar.aplicativo_base_id = ab.id
      LEFT JOIN aplicativos_rel ar2 ON ab.id = ar2.aplicativo_base_id
      WHERE ar.id = $1
      GROUP BY ar.id, ar.usuario_id, ar.aplicativo_base_id, ab.nombre
      `, 
      [id]
    );
    
    if (relacionInfo.rows.length === 0) {
      return res.status(404).json({ 
        mensaje: "Aplicativo no encontrado para este usuario" 
      });
    }

    const info = relacionInfo.rows[0];
    const esAplicativoPersonalizado = info.total_usuarios_con_este_aplicativo === 1;

    // Eliminar la relación usuario-aplicativo
    const resultRelacion = await pool.query(
      "DELETE FROM aplicativos_rel WHERE id = $1", 
      [id]
    );

    if (resultRelacion.rowCount === 0) {
      return res.status(404).json({ 
        mensaje: "No se pudo eliminar la relación del aplicativo" 
      });
    }

    // Si es un aplicativo personalizado (solo lo usa este usuario), eliminar también el aplicativo base
    if (esAplicativoPersonalizado) {
      await pool.query(
        "DELETE FROM aplicativos_base WHERE id = $1", 
        [info.aplicativo_base_id]
      );
      console.log(`✅ Aplicativo personalizado "${info.nombre}" eliminado completamente`);
    }

    res.json({ 
      mensaje: "Aplicativo eliminado correctamente",
      aplicativo_eliminado: esAplicativoPersonalizado,
      aplicativo_nombre: info.nombre
    });
  } catch (error) {
    console.error("❌ Error al eliminar aplicativo:", error);
    res.status(500).json({ 
      mensaje: "Error al eliminar aplicativo", 
      error: error.message 
    });
  }
};

/**
 * 📋 Obtener todos los aplicativos base disponibles
 * GET /api/aplicativos/disponibles
 */
const obtenerAplicativosDisponibles = async (req, res) => {
  try {
    const resultado = await pool.query(
      `
      SELECT 
        id,
        nombre,
        url,
        categoria
      FROM aplicativos_base
      ORDER BY categoria ASC, nombre ASC
      `
    );

    res.json(resultado.rows);
  } catch (error) {
    console.error("❌ Error al obtener aplicativos disponibles:", error);
    res.status(500).json({ 
      mensaje: "Error al obtener aplicativos disponibles", 
      error: error.message 
    });
  }
};

// Exporta los controladores
module.exports = {
  obtenerAplicativos,
  agregarAplicativo,
  asignarAplicativo,
  eliminarAplicativo,
  obtenerAplicativosDisponibles,
};
