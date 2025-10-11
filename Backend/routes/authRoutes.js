const express = require("express");
const router = express.Router();

const {
  registrarUsuario,
  loginUsuario,
  cambiarContraseña,
  recuperarContraseña,
  asignarContenidoDefecto,
} = require("../controllers/authController");

const verificarToken = require("../middlewares/auth");

router.post("/registro", registrarUsuario);
router.post("/login", loginUsuario);
router.put("/cambiar-contraseña", verificarToken, cambiarContraseña); // 🔒 protegida
router.put("/recuperar-contrasena", recuperarContraseña);        // 🔓 pública
router.post("/asignar-contenido-defecto", verificarToken, asignarContenidoDefecto); // 🔒 protegida

module.exports = router;
