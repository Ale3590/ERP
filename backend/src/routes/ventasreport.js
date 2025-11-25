// backend/src/routes/ventasreport.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // ✅ Path correcto al pool

// ================================
// 🔹 Obtener todas las ventas o filtradas por rango de fechas
// ================================
router.get('/', async (req, res) => {
  const { fecha_desde, fecha_hasta } = req.query;

  try {
    let query = `
      SELECT v.id, v.numero_venta, v.cliente_id, c.nombre AS cliente_nombre,
             v.total, TO_CHAR(v.fecha, 'YYYY-MM-DD HH24:MI:SS') AS fecha, v.estado
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
    `;
    const params = [];
    const whereClauses = [];

    if (fecha_desde) {
      whereClauses.push('DATE(v.fecha) >= $' + (params.length + 1));
      params.push(fecha_desde);
    }
    if (fecha_hasta) {
      whereClauses.push('DATE(v.fecha) <= $' + (params.length + 1));
      params.push(fecha_hasta);
    }
    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY v.fecha DESC';

    const { rows } = await pool.query(query, params);
    res.status(200).json(rows);

  } catch (err) {
    console.error('❌ Error fetch ventasreport:', err);
    res.status(500).json({ message: 'Error al obtener ventas', error: err.message });
  }
});

// ================================
// 🔹 Obtener detalles de una venta específica
// ================================
router.get('/:id', async (req, res) => {
  const ventaId = req.params.id;

  try {
    // Información general de la venta
    const ventaQuery = `
      SELECT v.id, v.numero_venta, v.cliente_id, c.nombre AS cliente_nombre,
             v.total, TO_CHAR(v.fecha, 'YYYY-MM-DD HH24:MI:SS') AS fecha, v.estado
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE v.id = $1
    `;
    const ventaResult = await pool.query(ventaQuery, [ventaId]);

    if (ventaResult.rows.length === 0) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    const venta = ventaResult.rows[0];

    // Detalles con código y nombre del producto
    const detallesQuery = `
      SELECT vd.id AS detalle_id, vd.cantidad, vd.precio, vd.descuento, vd.subtotal,
             p.codigo, p.nombre 
      FROM ventas_detalle vd
      LEFT JOIN producto p ON vd.producto_id = p.id
      WHERE vd.venta_id = $1
      ORDER BY vd.id ASC
    `;
    const detallesResult = await pool.query(detallesQuery, [ventaId]);

    venta.detalles = detallesResult.rows.map(d => ({
      detalle_id: d.detalle_id,
      producto: `${d.codigo || 'SIN CÓDIGO'} - ${d.nombre || 'SIN NOMBRE'}${d.categoria ? ' (' + d.categoria + ')' : ''}`,
      cantidad: d.cantidad,
      precio: Number(d.precio).toFixed(2),
      descuento: Number(d.descuento).toFixed(2) + '%',
      subtotal: Number(d.subtotal).toFixed(2)
    }));

    res.status(200).json(venta);

  } catch (err) {
    console.error('❌ Error fetch detalles de venta:', err);
    res.status(500).json({ message: 'Error al cargar detalles de venta', error: err.message });
  }
});

module.exports = router;