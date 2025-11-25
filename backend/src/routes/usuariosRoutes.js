const express = require("express");
const router = express.Router();
const { 
  listarRoles, 
  crearRol, 
  actualizarRol, 
  eliminarRol,
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} = require("../controllers/administracion/usuariosController");

// RUTAS DE ROLES
router.get("/roles", listarRoles);
router.post("/roles", crearRol);
router.put("/roles/:id", actualizarRol);
router.delete("/roles/:id", eliminarRol);

// RUTAS DE USUARIOS
router.get("/usuarios", listarUsuarios);
router.post("/usuarios", crearUsuario);
router.put("/usuarios/:id", actualizarUsuario);
router.delete("/usuarios/:id", eliminarUsuario);

module.exports = router;
