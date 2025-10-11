// Importa la conexión a la base de datos PostgreSQL
const db = require("../db");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.KEY;

/**
 * 🧾 Registrar un nuevo usuario
 * POST /api/usuarios/registro
 */
const registrarUsuario = async (req, res) => {
  const { nombre, email, contraseña } = req.body;

  try {
    // Verifica si el correo ya existe
    const existe = await db.query("SELECT id FROM usuarios WHERE email = $1", [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ mensaje: "El correo ya está registrado" });
    }

    const id = uuidv4();

    // Inserta nuevo usuario
    await db.query(
      `INSERT INTO usuarios (id, nombre, email, contraseña)
       VALUES ($1, $2, $3, $4)`,
      [id, nombre, email, contraseña]
    );

    // Genera un token JWT con expiración
    const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: "2h" });

    res.status(201).json({
      mensaje: "Registro exitoso",
      usuario: { id, nombre, email },
      token,
    });
  } catch (error) {
    console.error("❌ Error en registrarUsuario:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

/**
 * 🔐 Iniciar sesión
 * POST /api/usuarios/login
 */
const loginUsuario = async (req, res) => {
  const { email, contraseña } = req.body;

  try {
    const resultado = await db.query(
      "SELECT id, nombre, email, contraseña FROM usuarios WHERE email = $1",
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    const usuario = resultado.rows[0];
    if (usuario.contraseña !== contraseña) {
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: "2h" });

    res.json({
      mensaje: "Inicio de sesión exitoso",
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
      token,
    });
  } catch (error) {
    console.error("❌ Error en loginUsuario:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

/**
 * 🔒 Cambiar contraseña (requiere autenticación)
 * PUT /api/usuarios/cambiar-password
 */
const cambiarContraseña = async (req, res) => {
  const { actual, nueva } = req.body;
  const { email } = req.usuario; // viene del middleware de autenticación

  try {
    const resultado = await db.query("SELECT contraseña FROM usuarios WHERE email = $1", [email]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const usuario = resultado.rows[0];
    if (usuario.contraseña !== actual) {
      return res.status(401).json({ mensaje: "Contraseña actual incorrecta" });
    }

    await db.query("UPDATE usuarios SET contraseña = $1 WHERE email = $2", [nueva, email]);
    res.json({ mensaje: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("❌ Error al cambiar contraseña:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

/**
 * 🔓 Recuperar contraseña (pública)
 * PUT /api/usuarios/recuperar-password
 */
const recuperarContraseña = async (req, res) => {
  const { email, nueva } = req.body;

  try {
    const resultado = await db.query("SELECT id FROM usuarios WHERE email = $1", [email]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    await db.query("UPDATE usuarios SET contraseña = $1 WHERE email = $2", [nueva, email]);
    res.json({ mensaje: "Contraseña cambiada correctamente" });
  } catch (error) {
    console.error("❌ Error en recuperarContraseña:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  cambiarContraseña,
  recuperarContraseña,
};
