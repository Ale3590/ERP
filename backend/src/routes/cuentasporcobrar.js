// backend/src/routes/cuentasporcobrar.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // tu pool de DB

// 🔹 Listar todas las cuentas por cobrar
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id AS cliente_id,
        c.nombre AS cliente_nombre,
        c.codigo AS cliente_codigo,
        COALESCE(SUM(v.total),0) AS total_credito,
        COALESCE(SUM(v.pagado),0) AS total_pagado,
        COALESCE(SUM(v.total) - SUM(v.pagado),0) AS saldo_pendiente
      FROM clientes c
      LEFT JOIN ventas v 
        ON v.cliente_id = c.id 
        AND v.tipo_pago = 'credito'
        AND v.estado != 'anulada'
      GROUP BY c.id, c.nombre, c.codigo
      HAVING COALESCE(SUM(v.total) - SUM(v.pagado),0) > 0
      ORDER BY saldo_pendiente DESC
    `;

    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetch cuentas por cobrar:", err);
    res.status(500).json({ message: "Error al obtener cuentas por cobrar", error: err.message });
  }
});

module.exports = router;
