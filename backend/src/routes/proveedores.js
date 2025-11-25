const express = require('express');
const router = express.Router();
const { getProveedores, createProveedor, updateProveedor, deleteProveedor } = require('../controllers/administracion/proveedoresController');  // Path igual que en clientes.js

router.get('/', getProveedores);
router.post('/', createProveedor);
router.put('/:id', updateProveedor);
router.delete('/:id', deleteProveedor);

module.exports = router;