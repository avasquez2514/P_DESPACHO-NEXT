const express = require("express");
const router = express.Router();

const {
  registrarUsuario,
  loginUsuario,
  cambiarContraseña,
  recuperarContraseña,
} = require("../controllers/authController");

const verificarToken = require("../middlewares/auth");

router.post("/registro", registrarUsuario);
router.post("/login", loginUsuario);
router.put("/cambiar-contraseña", verificarToken, cambiarContraseña); // 🔒 protegida
router.put("/recuperar-contraseña", recuperarContraseña);             // 🔓 pública

module.exports = router;
