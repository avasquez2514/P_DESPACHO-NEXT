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
  const { usuario_id } = req.query; // Extrae el ID del usuario desde los parámetros de la consulta (?usuario_id=...)

  try {
    // Ejecuta la consulta a la base de datos para obtener los aplicativos del usuario
    const resultado = await db.query(
      "SELECT * FROM aplicativos WHERE usuario_id = $1",
      [usuario_id]
    );

    // Responde con los resultados obtenidos
    res.json(resultado.rows);
  } catch (error) {
    // Manejo de errores en consola y en la respuesta
    console.error("❌ Error al obtener aplicativos:", error);
    res.status(500).json({ mensaje: "Error al obtener aplicativos" });
  }
};

/**
 * Agregar un nuevo aplicativo al sistema
 * Método: POST
 * Ruta: /api/aplicativos
 * Body esperado: { nombre, url, usuario_id, categoria }
 */
const agregarAplicativo = async (req, res) => {
  const { nombre, url, usuario_id, categoria } = req.body; // Extrae datos del cuerpo de la solicitud

  try {
    const id = uuidv4(); // Genera un ID único para el nuevo aplicativo

    // Inserta el nuevo aplicativo en la base de datos
    await db.query(
      "INSERT INTO aplicativos (id, nombre, url, usuario_id, categoria) VALUES ($1, $2, $3, $4, $5)",
      [id, nombre, url, usuario_id, categoria]
    );

    // Responde con éxito
    res.status(201).json({ mensaje: "Aplicativo agregado exitosamente" });
  } catch (error) {
    // Manejo de errores en consola y en la respuesta
    console.error("❌ Error al agregar aplicativo:", error);
    res.status(500).json({ mensaje: "Error al agregar aplicativo" });
  }
};

/**
 * Eliminar un aplicativo por su ID
 * Método: DELETE
 * Ruta: /api/aplicativos/:id
 */
const eliminarAplicativo = async (req, res) => {
  const { id } = req.params; // Extrae el ID desde los parámetros de la ruta

  try {
    // Elimina el aplicativo correspondiente de la base de datos
    await db.query("DELETE FROM aplicativos WHERE id = $1", [id]);

    // Responde con éxito
    res.json({ mensaje: "Aplicativo eliminado correctamente" });
  } catch (error) {
    // Manejo de errores en consola y en la respuesta
    console.error("❌ Error al eliminar aplicativo:", error);
    res.status(500).json({ mensaje: "Error al eliminar aplicativo" });
  }
};

// Exporta los controladores para que puedan ser utilizados en las rutas Express
module.exports = {
  obtenerAplicativos,
  agregarAplicativo,
  eliminarAplicativo,
};
