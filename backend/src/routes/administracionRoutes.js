const express = require('express');
const router = express.Router();

// Importa controllers
const { getUsuarios, createUsuario, updateUsuario, deleteUsuario } = require('../controllers/administracion/usuariosController');
const { getRoles } = require('../controllers/administracion/rolesController');
const { getPermisos, getPermisosPorRol, updatePermisosRol } = require('../controllers/administracion/permisosController');

// Rutas USUARIOS (CRUD completo)
router.get('/usuarios', getUsuarios);      // GET lista
router.post('/usuarios', createUsuario);   // POST crear
router.put('/usuarios/:id', updateUsuario); // PUT editar
router.delete('/usuarios/:id', deleteUsuario); // DELETE eliminar

// Rutas ROLES
router.get('/roles', getRoles);   // GET lista roles

// Rutas PERMISOS
router.get('/permisos', getPermisos);                          // Lista todos
router.get('/roles/:id/permisos', getPermisosPorRol);          // Permisos de un rol
router.put('/roles/:id/permisos', updatePermisosRol);          // Actualizar permisos

module.exports = router;