const express = require("express");
const router = express.Router();

const {
  registrarUsuario,
  loginUsuario,
  cambiarContraseña,
} = require("../controllers/authController");

const verificarToken = require("../middlewares/auth");

router.post("/registro", registrarUsuario);
router.post("/login", loginUsuario);
router.put("/cambiar-contraseña", verificarToken, cambiarContraseña); // ✅ Nueva ruta protegida

module.exports = router;
