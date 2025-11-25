const express = require('express');
const router = express.Router();
const { getTiposPago, createTipoPago, updateTipoPago, deleteTipoPago } = require('../controllers/administracion/tiposPagoController');  // Path correcto: desde routes/ a controllers/administracion/

router.get('/', getTiposPago);          // GET /api/parametros/tipos-pago
router.post('/', createTipoPago);       // POST /api/parametros/tipos-pago
router.put('/:id', updateTipoPago);     // PUT /api/parametros/tipos-pago/:id
router.delete('/:id', deleteTipoPago);  // DELETE /api/parametros/tipos-pago/:id

module.exports = router;