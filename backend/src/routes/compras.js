const express = require('express');
const router = express.Router();
const { createIngreso, getCompras, getCompraById } = require('../controllers/compras/comprasController');

// Registrar ingreso de mercadería
router.post('/ingreso', createIngreso);

// Listar todas las compras
router.get('/', getCompras);

// Obtener detalle de una compra
router.get('/:id', getCompraById);

module.exports = router;
