const express = require('express');
const router = express.Router();
const {
  getClientes,
  getClientesCredito,
  getClientesPorTipoPago, // ✅ nuevo import
  createCliente,
  updateCliente,
  deleteCliente
} = require('../controllers/administracion/clientesController');

// Rutas existentes
router.get('/', getClientes);
router.get('/credito', getClientesCredito);
router.get('/tipo-pago', getClientesPorTipoPago); // ✅ nueva ruta para la gráfica
router.post('/', createCliente);
router.put('/:id', updateCliente);
router.delete('/:id', deleteCliente);

module.exports = router;
