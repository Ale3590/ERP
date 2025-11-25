// =========================
// IMPORTS
// =========================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// =========================
// RUTAS
// =========================
const parametrosRoutes = require('./routes/parametrosRoutes');        // Parámetros (categorías, productos, etc.)
const marcasRoutes = require('./routes/marcas');                      // Submódulo Marcas
const clientesRoutes = require('./routes/clientes');                  // Submódulo Clientes
const authRoutes = require('./routes/authRoutes');                    // Auth
const administracionRoutes = require('./routes/administracionRoutes'); // Administración
const proveedoresRoutes = require('./routes/proveedores');            // Proveedores
const ventasRoutes = require('./routes/ventas');                      // Ventas
const ventasreportRoutes = require('./routes/ventasreport');          // Reporte de Ventas
const comprasRoutes = require('./routes/compras');                    // Compras / Ingreso mercadería
const cuentaspagarreportRoutes = require('./routes/cuentaspagarreport'); // ✅ Reporte Cuentas por Pagar
const kardexRoutes = require('./routes/kardex');

// =========================
// INICIALIZAR APP
// =========================
const app = express();

// =========================
// MIDDLEWARES
// =========================
app.use(cors({ 
  origin: 'http://localhost:3000',  // Ajusta según tu frontend
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// RUTAS
// =========================

// Parámetros generales
app.use('/api/parametros', parametrosRoutes);
console.log('✅ Rutas de parámetros montadas');

// Submódulo Marcas
app.use('/api/parametros/marcas', marcasRoutes);
console.log('✅ Rutas de marcas montadas');

// Clientes
app.use('/api/clientes', clientesRoutes);
console.log('✅ Rutas de clientes montadas');

// Auth
app.use('/api/auth', authRoutes);
console.log('✅ Rutas de auth montadas');

// Administración
app.use('/api/admin', administracionRoutes);
console.log('✅ Rutas de administración montadas');

// Proveedores
app.use('/api/proveedores', proveedoresRoutes);
console.log('✅ Rutas de proveedores montadas');

// Ventas
app.use('/api/ventas', ventasRoutes);
console.log('✅ Rutas de ventas montadas');

// Reporte de ventas
app.use('/api/ventasreport', ventasreportRoutes);
console.log('✅ Rutas de reportes ventas montadas (/api/ventasreport)');

// Compras / ingreso de mercadería
app.use('/api/compras', comprasRoutes);
console.log('✅ Rutas de compras montadas (/ingreso y /)');

// ✅ Reporte de cuentas por pagar
app.use('/api/cuentaspagarreport', cuentaspagarreportRoutes);
console.log('✅ Rutas de reportes cuentas por pagar montadas (/api/cuentaspagarreport)');

app.use('/api/kardex', kardexRoutes);
console.log('✅ Rutas de Kardex montadas (/api/kardex)');

// =========================
// RUTAS DE PRUEBA Y BASE
// =========================

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Backend funcionando correctamente!' });
});

// Ruta base (para evitar "Cannot GET /")
app.get('/', (req, res) => {
  res.send('✅ Backend activo y corriendo en puerto ' + (process.env.PORT || 5000));
});

// =========================
// ERROR HANDLER GLOBAL
// =========================
app.use((err, req, res, next) => {
  console.error('❌ Error global:', err.stack);
  res.status(500).json({ message: 'Algo salió mal en el servidor' });
});

// =========================
// EXPORTAR APP
// =========================
module.exports = app;
