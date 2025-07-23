// Importa la conexión a la base de datos PostgreSQL
const db = require("../db");

// Importa la función uuidv4 para generar identificadores únicos
const { v4: uuidv4 } = require("uuid");

// Importa JSON Web Token para autenticación
const jwt = require("jsonwebtoken");

// Clave secreta para firmar los tokens JWT
// ⚠️ En producción se recomienda usar process.env.JWT_SECRET y no dejarla fija en el código
const JWT_SECRET = "tu_clave_secreta"; // Reemplázalo por una variable de entorno en producción

/**
 * Registrar un nuevo usuario en la base de datos
 * - Verifica si el correo ya está registrado
 * - Inserta el usuario en la tabla `usuarios`
 * - Copia plantillas base y aplicativos base al nuevo usuario
 * - Devuelve un token de autenticación JWT
 */
const registrarUsuario = async (req, res) => {
  const { nombre, email, contraseña } = req.body;

  try {
    const id = uuidv4();

    // Verifica si el correo ya existe
    const existe = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ mensaje: "El correo ya está registrado" });
    }

    // Inserta el nuevo usuario
    await db.query(
      "INSERT INTO usuarios (id, nombre, email, contraseña) VALUES ($1, $2, $3, $4)",
      [id, nombre, email, contraseña] // ⚠️ En producción debes encriptar la contraseña
    );

    // Copiar plantillas base para notas de despacho
    await db.query(
      `INSERT INTO notas_despacho (usuario_id, novedad, nota_publica, nota_interna, nota_avances, plantilla)
       SELECT $1, novedad, nota_publica, nota_interna, nota_avances, plantilla
       FROM plantillas_base`,
      [id]
    );

    // Copiar aplicativos base con UUID y categoría
    await db.query(
      `INSERT INTO aplicativos (id, nombre, url, categoria, usuario_id)
       SELECT gen_random_uuid(), nombre, url, categoria, $1 FROM aplicativos_base`,
      [id]
    );

    // Crear token JWT para el nuevo usuario
    const token = jwt.sign({ id }, JWT_SECRET);

    // Enviar respuesta al cliente
    res.json({
      mensaje: "Registro exitoso",
      token,
      usuario: {
        id,
        nombre,
        email,
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

/**
 * Iniciar sesión de usuario
 * - Verifica que el email exista
 * - Compara la contraseña
 * - Devuelve token JWT si las credenciales son correctas
 */
const loginUsuario = async (req, res) => {
  const { email, contraseña } = req.body;

  try {
    // Buscar usuario por email
    const resultado = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    const usuario = resultado.rows[0];

    // Validación básica de credenciales (⚠️ usar bcrypt en producción)
    if (!usuario || usuario.contraseña !== contraseña) {
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    // Crear token JWT
    const token = jwt.sign({ id: usuario.id }, JWT_SECRET);

    // Enviar respuesta al cliente
    res.json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

// Exporta las funciones para usarlas en el archivo de rutas
module.exports = {
  registrarUsuario,
  loginUsuario,
};
