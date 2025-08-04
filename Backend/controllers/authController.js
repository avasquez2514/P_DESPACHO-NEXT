const db = require("../db");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.KEY;

const registrarUsuario = async (req, res) => {
  const { nombre, email, contraseña } = req.body;

  try {
    const id = uuidv4();

    const existe = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ mensaje: "El correo ya está registrado" });
    }

    await db.query(
      "INSERT INTO usuarios (id, nombre, email, contraseña) VALUES ($1, $2, $3, $4)",
      [id, nombre, email, contraseña]
    );

    await db.query(
      `INSERT INTO notas_despacho (usuario_id, novedad, nota_publica, nota_interna, nota_avances, plantilla)
       SELECT $1, novedad, nota_publica, nota_interna, nota_avances, plantilla
       FROM plantillas_base`,
      [id]
    );

    await db.query(
      `INSERT INTO aplicativos (id, nombre, url, categoria, usuario_id)
       SELECT gen_random_uuid(), nombre, url, categoria, $1 FROM aplicativos_base`,
      [id]
    );

    const token = jwt.sign({ id }, JWT_SECRET);

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

const loginUsuario = async (req, res) => {
  const { email, contraseña } = req.body;

  try {
    const resultado = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    const usuario = resultado.rows[0];

    if (!usuario || usuario.contraseña !== contraseña) {
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    const token = jwt.sign({ id: usuario.id }, JWT_SECRET);

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

// ✅ Nueva función: Cambiar contraseña
const cambiarContraseña = async (req, res) => {
  const { id } = req.usuario; // viene del token
  const { actual, nueva } = req.body;

  try {
    const resultado = await db.query("SELECT * FROM usuarios WHERE id = $1", [id]);
    const usuario = resultado.rows[0];

    if (!usuario || usuario.contraseña !== actual) {
      return res.status(401).json({ mensaje: "Contraseña actual incorrecta" });
    }

    await db.query("UPDATE usuarios SET contraseña = $1 WHERE id = $2", [nueva, id]);

    res.json({ mensaje: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  cambiarContraseña,
};
