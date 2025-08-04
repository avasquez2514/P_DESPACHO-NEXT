const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.KEY;

const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ mensaje: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded; // lo que metiste en el token
    next();
  } catch (error) {
    return res.status(403).json({ mensaje: "Token inválido" });
  }
};

module.exports = verificarToken;
