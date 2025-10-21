const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.KEY;

const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ mensaje: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ mensaje: "Token no encontrado" });
  }

  if (!JWT_SECRET) {
    console.error("❌ JWT_SECRET no está configurado. Verificar archivo .env");
    return res.status(500).json({ mensaje: "Error de configuración del servidor" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded; // contiene { id, email }
    next();
  } catch (error) {
    console.error("❌ Error al verificar token:", error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ mensaje: "Token expirado" });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ mensaje: "Token inválido" });
    } else {
      return res.status(403).json({ mensaje: "Token inválido" });
    }
  }
};

module.exports = verificarToken;
