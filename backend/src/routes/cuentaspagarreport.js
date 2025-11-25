// backend/src/routes/cuentaspagarreport.js
const express = require('express');
const router = express.Router();

let pool = null;
const possiblePaths = [
  '../config/db',
  '../../config/db',
  '../../../config/db',
  '../../../../config/db'
];

for (const path of possiblePaths) {
  try {
    const imported = require(path);
    if (imported && typeof imported.query === 'function') {
      pool = imported;
      console.log(`✅ Pool DB cargado correctamente desde: ${path}`);
      break;
    }
  } catch (err) {
    console.warn(`⚠️ Intento fallido al cargar DB desde ${path}: ${err.message}`);
  }
}

if (!pool) {
  console.error('❌ No se pudo cargar el pool de conexión a la base de datos.');
}

// =======================================================
// 🔹 Obtener todas las compras (cuentas por pagar)
// =======================================================
router.get('/', async (req, res) => {
  const { fecha_desde, fecha_hasta } = req.query;

  try {
    let query = `
      SELECT 
        i.id, 
        i.numero_factura, 
        i.proveedor_id, 
        p.nombre AS proveedor_nombre,
        p.nit,
        tp.nombre AS tipo_pago_nombre,
        i.total, 
        TO_CHAR(i.fecha, 'YYYY-MM-DD HH24:MI:SS') AS fecha,
        CASE 
          WHEN tp.nombre ILIKE 'crédito' THEN 'Pendiente'
          WHEN tp.nombre ILIKE 'contado' THEN 'Pagado'
          ELSE 'Sin estado'
        END AS estado
      FROM ingresos i
      LEFT JOIN proveedores p ON i.proveedor_id = p.id
      LEFT JOIN tipos_pago tp ON p.tipo_pago_id = tp.id
    `;

    const params = [];
    const whereClauses = [];

    if (fecha_desde) {
      whereClauses.push(`DATE(i.fecha) >= $${params.length + 1}`);
      params.push(fecha_desde);
    }
    if (fecha_hasta) {
      whereClauses.push(`DATE(i.fecha) <= $${params.length + 1}`);
      params.push(fecha_hasta);
    }
    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY i.fecha DESC';

    const { rows } = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (err) {
    console.error('❌ Error al obtener cuentas por pagar:', err);
    res.status(500).json({ message: 'Error al obtener cuentas por pagar', error: err.message });
  }
});

// =======================================================
// 🔹 Obtener detalles de una compra específica
// =======================================================
router.get('/:id', async (req, res) => {
  const compraId = req.params.id;

  try {
    const compraQuery = `
      SELECT 
        i.id, 
        i.numero_factura, 
        i.proveedor_id, 
        p.nombre AS proveedor_nombre,
        p.nit,
        tp.nombre AS tipo_pago_nombre,
        i.total, 
        TO_CHAR(i.fecha, 'YYYY-MM-DD HH24:MI:SS') AS fecha,
        CASE 
          WHEN tp.nombre ILIKE 'crédito' THEN 'Pendiente'
          WHEN tp.nombre ILIKE 'contado' THEN 'Pagado'
          ELSE 'Sin estado'
        END AS estado
      FROM ingresos i
      LEFT JOIN proveedores p ON i.proveedor_id = p.id
      LEFT JOIN tipos_pago tp ON p.tipo_pago_id = tp.id
      WHERE i.id = $1
    `;
    const compraResult = await pool.query(compraQuery, [compraId]);

    if (compraResult.rows.length === 0) {
      return res.status(404).json({ message: 'Compra no encontrada' });
    }

    const compra = compraResult.rows[0];

    const detallesQuery = `
      SELECT id.id AS detalle_id, id.cantidad, id.precio, id.subtotal,
             pr.codigo, pr.nombre, pr.categoria
      FROM ingresos_detalle id
      LEFT JOIN producto pr ON id.producto_id = pr.id
      WHERE id.ingreso_id = $1
      ORDER BY id.id ASC
    `;
    const detallesResult = await pool.query(detallesQuery, [compraId]);

    compra.detalles = detallesResult.rows.map((d) => ({
      detalle_id: d.detalle_id,
      producto: `${d.codigo || 'SIN CÓDIGO'} - ${d.nombre || 'SIN NOMBRE'}${d.categoria ? ' (' + d.categoria + ')' : ''}`,
      cantidad: d.cantidad,
      precio: Number(d.precio).toFixed(2),
      subtotal: Number(d.subtotal).toFixed(2),
    }));

    res.status(200).json(compra);
  } catch (err) {
    console.error('❌ Error al obtener detalles de compra:', err);
    res.status(500).json({ message: 'Error al cargar detalles de compra', error: err.message });
  }
});

module.exports = router;
