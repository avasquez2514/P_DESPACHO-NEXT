// Importa la conexión a la base de datos PostgreSQL
const pool = require("../db");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.KEY;

/**
 * 📝 Función para crear aplicativos base por defecto si no existen
 */
const crearAplicativosBasePorDefecto = async () => {
  try {
    // Verificar si ya existen aplicativos base
    const aplicativosExistentes = await pool.query("SELECT COUNT(*) FROM aplicativos_base");
    
    if (aplicativosExistentes.rows[0].count > 0) {
      console.log("✅ Ya existen aplicativos base en la base de datos");
      return;
    }

    // Crear aplicativos base por defecto
    const aplicativosDefecto = [
      {
        nombre: "Gmail",
        url: "https://mail.google.com",
        categoria: "Correo"
      },
      {
        nombre: "Google Drive",
        url: "https://drive.google.com",
        categoria: "Almacenamiento"
      },
      {
        nombre: "Google Calendar",
        url: "https://calendar.google.com",
        categoria: "Calendario"
      },
      {
        nombre: "Microsoft Office",
        url: "https://office.com",
        categoria: "Productividad"
      },
      {
        nombre: "WhatsApp Web",
        url: "https://web.whatsapp.com",
        categoria: "Comunicación"
      }
    ];

    // Insertar aplicativos base por defecto
    for (const aplicativo of aplicativosDefecto) {
      const id = uuidv4();
      await pool.query(
        `
        INSERT INTO aplicativos_base (id, nombre, url, categoria)
        VALUES ($1, $2, $3, $4)
        `,
        [id, aplicativo.nombre, aplicativo.url, aplicativo.categoria]
      );
    }

    console.log(`✅ Se crearon ${aplicativosDefecto.length} aplicativos base por defecto`);
  } catch (error) {
    console.error("❌ Error al crear aplicativos base por defecto:", error);
    throw error;
  }
};

/**
 * 📝 Función para crear plantillas base por defecto si no existen
 */
const crearPlantillasBasePorDefecto = async () => {
  try {
    // Verificar si ya existen plantillas base
    const plantillasExistentes = await pool.query("SELECT COUNT(*) FROM plantillas_base");
    
    if (plantillasExistentes.rows[0].count > 0) {
      console.log("✅ Ya existen plantillas base en la base de datos");
      return;
    }

    // Crear plantillas base por defecto
    const plantillasDefecto = [
      {
        novedad: "Bienvenida",
        nota_publica: "Bienvenido al sistema de despacho. Esta es tu primera nota pública.",
        nota_interna: "Nota interna de bienvenida para uso del personal.",
        nota_avances: "Aquí puedes registrar los avances de tus actividades.",
        plantilla: "Plantilla de bienvenida para nuevos usuarios"
      },
      {
        novedad: "Nota General",
        nota_publica: "Contenido público de la nota general.",
        nota_interna: "Información interna de la nota general.",
        nota_avances: "Registro de avances para la nota general.",
        plantilla: "Plantilla general para uso diario"
      },
      {
        novedad: "Recordatorio",
        nota_publica: "Recordatorio público visible para todos.",
        nota_interna: "Información interna del recordatorio.",
        nota_avances: "Seguimiento de recordatorios pendientes.",
        plantilla: "Plantilla para recordatorios importantes"
      }
    ];

    // Insertar plantillas base por defecto
    for (const plantilla of plantillasDefecto) {
      const id = uuidv4();
      await pool.query(
        `
        INSERT INTO plantillas_base (id, novedad, nota_publica, nota_interna, nota_avances, plantilla)
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [id, plantilla.novedad, plantilla.nota_publica, plantilla.nota_interna, plantilla.nota_avances, plantilla.plantilla]
      );
    }

    console.log(`✅ Se crearon ${plantillasDefecto.length} plantillas base por defecto`);
  } catch (error) {
    console.error("❌ Error al crear plantillas base por defecto:", error);
    throw error;
  }
};

/**
 * 📝 Función para asignar aplicativos por defecto a un usuario nuevo
 */
const asignarAplicativosPorDefecto = async (usuario_id) => {
  try {
    // Primero asegurar que existan aplicativos base
    await crearAplicativosBasePorDefecto();

    // Obtener todos los aplicativos base disponibles
    const aplicativosResult = await pool.query(
      "SELECT id FROM aplicativos_base ORDER BY categoria ASC, nombre ASC"
    );

    if (aplicativosResult.rows.length === 0) {
      console.log("⚠️ No hay aplicativos base disponibles para asignar");
      return;
    }

    // Asignar cada aplicativo base al usuario nuevo
    for (const aplicativo of aplicativosResult.rows) {
      const relacionId = uuidv4();
      await pool.query(
        `
        INSERT INTO aplicativos_rel (id, usuario_id, aplicativo_base_id, creado_en)
        VALUES ($1, $2, $3, NOW())
        `,
        [relacionId, usuario_id, aplicativo.id]
      );
    }

    console.log(`✅ Se asignaron ${aplicativosResult.rows.length} aplicativos por defecto al usuario ${usuario_id}`);
  } catch (error) {
    console.error("❌ Error al asignar aplicativos por defecto:", error);
    throw error;
  }
};

/**
 * 📝 Función para asignar plantillas por defecto a un usuario nuevo
 */
const asignarPlantillasPorDefecto = async (usuario_id) => {
  try {
    // Primero asegurar que existan plantillas base
    await crearPlantillasBasePorDefecto();

    // Obtener todas las plantillas base disponibles
    const plantillasResult = await pool.query(
      "SELECT id FROM plantillas_base ORDER BY id ASC"
    );

    if (plantillasResult.rows.length === 0) {
      console.log("⚠️ No hay plantillas base disponibles para asignar");
      return;
    }

    // Asignar cada plantilla base al usuario nuevo
    for (const plantilla of plantillasResult.rows) {
      const relacionId = uuidv4();
      await pool.query(
        `
        INSERT INTO notas_despacho_rel (id, usuario_id, plantilla_id, creado_en)
        VALUES ($1, $2, $3, NOW())
        `,
        [relacionId, usuario_id, plantilla.id]
      );
    }

    console.log(`✅ Se asignaron ${plantillasResult.rows.length} plantillas por defecto al usuario ${usuario_id}`);
  } catch (error) {
    console.error("❌ Error al asignar plantillas por defecto:", error);
    throw error;
  }
};

/**
 * 🧾 Registrar un nuevo usuario
 * POST /api/usuarios/registro
 */
const registrarUsuario = async (req, res) => {
  const { nombre, email, contraseña } = req.body;

  try {
    // Verifica si el correo ya existe
    const existe = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ mensaje: "El correo ya está registrado" });
    }

    const id = uuidv4();

    // Inserta nuevo usuario
    await pool.query(
      `INSERT INTO usuarios (id, nombre, email, contraseña)
       VALUES ($1, $2, $3, $4)`,
      [id, nombre, email, contraseña]
    );

    // 🆕 Asignar plantillas y aplicativos por defecto al usuario nuevo
    try {
      await asignarPlantillasPorDefecto(id);
      await asignarAplicativosPorDefecto(id);
    } catch (asignacionError) {
      console.error("⚠️ Error al asignar contenido por defecto, pero el usuario fue creado:", asignacionError);
      // No fallar el registro si hay error en las asignaciones
    }

    // Genera un token JWT con expiración
    const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: "8h" });

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
    const resultado = await pool.query(
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

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: "8h" });

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
    const resultado = await pool.query("SELECT contraseña FROM usuarios WHERE email = $1", [email]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const usuario = resultado.rows[0];
    if (usuario.contraseña !== actual) {
      return res.status(401).json({ mensaje: "Contraseña actual incorrecta" });
    }

    await pool.query("UPDATE usuarios SET contraseña = $1 WHERE email = $2", [nueva, email]);
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
    const resultado = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    await pool.query("UPDATE usuarios SET contraseña = $1 WHERE email = $2", [nueva, email]);
    res.json({ mensaje: "Contraseña cambiada correctamente" });
  } catch (error) {
    console.error("❌ Error en recuperarContraseña:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

/**
 * 🔄 Función para asignar contenido por defecto a usuarios existentes
 * POST /api/auth/asignar-contenido-defecto
 */
const asignarContenidoDefecto = async (req, res) => {
  const { usuario_id } = req.body;

  if (!usuario_id) {
    return res.status(400).json({ 
      mensaje: "Se requiere usuario_id" 
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

    // Asignar plantillas y aplicativos por defecto
    await asignarPlantillasPorDefecto(usuario_id);
    await asignarAplicativosPorDefecto(usuario_id);

    res.json({ 
      mensaje: "Contenido por defecto asignado exitosamente al usuario" 
    });
  } catch (error) {
    console.error("❌ Error al asignar contenido por defecto:", error);
    res.status(500).json({ 
      mensaje: "Error al asignar contenido por defecto", 
      error: error.message 
    });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  cambiarContraseña,
  recuperarContraseña,
  asignarContenidoDefecto,
};
