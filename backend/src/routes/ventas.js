const express = require('express');
const router = express.Router();
const { createVenta, getVentas, getVentasSemana } = require('../controllers/administracion/ventasController');

// Rutas existentes
router.post('/', createVenta);  // Crear venta
router.get('/', getVentas);     // Listar últimas ventas

// ✅ Nueva ruta para ventas de la semana
router.get('/semana', getVentasSemana);

module.exports = router;
