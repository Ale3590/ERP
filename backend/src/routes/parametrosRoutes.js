// backend/src/routes/parametrosRoutes.js
const express = require('express');
const router = express.Router();

// Importar sub-rutas (¡tiposPagoRoutes debe apuntar a tiposPago.js!)
const marcasRoutes = require('./marcas');
const tiposPagoRoutes = require('./tiposPago');  // <-- CLAVE: Importa el archivo correcto

// Controllers para categorías y productos (opcional: si no los tienes, se salta)
let getCategorias, createCategoria, updateCategoria, deleteCategoria;
let getProductos, createProducto, updateProducto, deleteProducto;

try {
  // Importa si existe (ajusta ruta si tu controller está en otro lugar)
  const parametrosController = require('../controllers/administracion/parametrosController');
  ({ 
    getCategorias, createCategoria, updateCategoria, deleteCategoria,
    getProductos, createProducto, updateProducto, deleteProducto 
  } = parametrosController);
  console.log('✅ Controllers de parámetros cargados');
} catch (error) {
  console.warn('⚠️ parametrosController no encontrado. Rutas de categorías/productos deshabilitadas:', error.message);
}

// Rutas para Categorías (solo si existen)
if (getCategorias) {
  router.get('/categorias', getCategorias);
  router.post('/categorias', createCategoria);
  router.put('/categorias/:id', updateCategoria);
  router.delete('/categorias/:id', deleteCategoria);
  console.log('✅ Rutas de categorías montadas');
}

// Rutas para Productos (solo si existen)
if (getProductos) {
  router.get('/productos', getProductos);
  router.post('/productos', createProducto);
  router.put('/productos/:id', updateProducto);
  router.delete('/productos/:id', deleteProducto);
  console.log('✅ Rutas de productos montadas');
}

// Sub-rutas: Marcas (montadas en /api/parametros/marcas)
router.use('/marcas', marcasRoutes);
console.log('✅ Sub-ruta de marcas montada');

// Sub-rutas: Tipos de Pago (¡AHORA SÍ FUNCIONA! Montada en /api/parametros/tipos-pago)
router.use('/tipos-pago', tiposPagoRoutes);
console.log('✅ Sub-ruta de tipos-pago montada');  // <-- Log para confirmar en terminal

module.exports = router;