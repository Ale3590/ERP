const express = require('express');
const router = express.Router();
const pool = require("../config/db"); // tu pool de DB

// Obtener movimientos del Kardex por producto
router.get('/:productoId', async (req, res) => {
  const { productoId } = req.params;

  try {
    const result = await pool.query(
      `SELECT k.id, k.fecha, k.tipo_movimiento, k.cantidad, k.existencia, 
              k.referencia, k.observacion, p.nombre AS producto
       FROM kardex k
       JOIN producto p ON p.id = k.producto_id
       WHERE k.producto_id = $1
       ORDER BY k.fecha DESC`,
      [productoId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener Kardex:', error);
    res.status(500).json({ message: 'Error al obtener el Kardex' });
  }
});

module.exports = router;
