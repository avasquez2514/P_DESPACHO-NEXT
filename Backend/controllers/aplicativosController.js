// ✅ Controlador de Aplicativos Normalizado

// Importa la conexión a la base de datos PostgreSQL
const db = require("../db");

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
    const resultado = await db.query(
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
 * Agregar un nuevo aplicativo a un usuario
 * Método: POST
 * Ruta: /api/aplicativos
 * Body esperado: { usuario_id, aplicativo_base_id }
 */
const agregarAplicativo = async (req, res) => {
  const { usuario_id, aplicativo_base_id } = req.body;

  try {
    const id = uuidv4();

    // 🔹 Inserta la relación usuario-aplicativo en la tabla relacional
    await db.query(
      `
      INSERT INTO aplicativos_rel (id, usuario_id, aplicativo_base_id, creado_en)
      VALUES ($1, $2, $3, NOW())
      `,
      [id, usuario_id, aplicativo_base_id]
    );

    res.status(201).json({ mensaje: "Aplicativo agregado exitosamente" });
  } catch (error) {
    console.error("❌ Error al agregar aplicativo:", error);
    res.status(500).json({ mensaje: "Error al agregar aplicativo" });
  }
};

/**
 * Eliminar un aplicativo de un usuario
 * Método: DELETE
 * Ruta: /api/aplicativos/:id
 * (id = id de aplicativos_rel)
 */
const eliminarAplicativo = async (req, res) => {
  const { id } = req.params;

  try {
    // 🔹 Elimina la relación usuario-aplicativo (no el aplicativo base)
    await db.query("DELETE FROM aplicativos_rel WHERE id = $1", [id]);

    res.json({ mensaje: "Aplicativo eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar aplicativo:", error);
    res.status(500).json({ mensaje: "Error al eliminar aplicativo" });
  }
};

// Exporta los controladores
module.exports = {
  obtenerAplicativos,
  agregarAplicativo,
  eliminarAplicativo,
};
