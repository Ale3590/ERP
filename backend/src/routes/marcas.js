const express = require('express');
const router = express.Router();
const { getMarcas, createMarca, updateMarca, deleteMarca } = require('../controllers/administracion/marcasController');  // Path correcto: desde routes/ a controllers/administracion/

router.get('/', getMarcas);          // GET /api/parametros/marcas
router.post('/', createMarca);       // POST /api/parametros/marcas
router.put('/:id', updateMarca);     // PUT /api/parametros/marcas/:id
router.delete('/:id', deleteMarca);  // DELETE /api/parametros/marcas/:id

module.exports = router;