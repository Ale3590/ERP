const express = require('express');
const router = express.Router();
const { getKardexByProducto } = require('../controllers/reportesController');

// Endpoint principal del Kardex
router.get('/kardex/:id', getKardexByProducto);

module.exports = router;
