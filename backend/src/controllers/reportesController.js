const pool = require('../db'); // Ajusta si tu conexión está en otra carpeta

// 🔹 Obtener movimientos de Kardex por producto
const getKardexByProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaInicio, fechaFin } = req.query;

    let query = `
      SELECT 
        fecha,
        tipo_movimiento AS tipo,
        documento,
        entrada,
        salida,
        saldo
      FROM kardex
      WHERE producto_id = $1
    `;
    const params = [id];

    if (fechaInicio && fechaFin) {
      query += ` AND fecha BETWEEN $2 AND $3`;
      params.push(fechaInicio, fechaFin);
    }

    query += ` ORDER BY fecha ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener Kardex:", error);
    res.status(500).json({ message: "Error al consultar el Kardex" });
  }
};

module.exports = { getKardexByProducto };
