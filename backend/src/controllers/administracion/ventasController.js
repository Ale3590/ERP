const pool = require('../../config/db');  

// POST /api/ventas - Crear venta
const createVenta = async (req, res) => {
  const { cliente_id, items, total } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Generar número secuencial (FAC-001, FAC-002, etc.)
    const seqRes = await client.query(`
      SELECT COALESCE(MAX(CAST(SUBSTRING(numero_venta FROM 5) AS INTEGER)), 0) + 1 AS next
      FROM ventas
      WHERE numero_venta LIKE 'FAC-%'
    `);
    const nextNum = seqRes.rows[0].next.toString().padStart(3, '0');
    const numero_venta = `FAC-${nextNum}`;

    // Insertar cabecera
    const ventaRes = await client.query(
      `INSERT INTO ventas (numero_venta, cliente_id, total) 
       VALUES ($1, $2, $3) 
       RETURNING id, numero_venta`,
      [numero_venta, cliente_id, total]
    );
    const ventaId = ventaRes.rows[0].id;

    // Insertar detalles
    for (const item of items) {
      await client.query(
        `INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, descuento, precio) 
         VALUES ($1, $2, $3, $4, $5)`,
        [ventaId, item.producto_id, item.cantidad, item.descuento, item.precio]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ 
      message: 'Venta creada exitosamente', 
      numero_venta, 
      id: ventaId, 
      total 
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error createVenta:', err);
    res.status(400).json({ message: err.message || 'Error al crear venta' });
  } finally {
    client.release();
  }
};

// GET /api/ventas - Listar últimas 50 ventas
const getVentas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.id, v.numero_venta, v.total, v.fecha,
             c.nombre AS cliente_nombre
      FROM ventas v
      JOIN clientes c ON v.cliente_id = c.id
      ORDER BY v.fecha DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error getVentas:', err);
    res.status(500).json({ message: 'Error al cargar facturas' });
  }
};

// ✅ GET /api/ventas/semana - Ventas agregadas por día de la semana actual
const getVentasSemana = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT TO_CHAR(fecha, 'Dy') AS name, SUM(total) AS ventas
      FROM ventas
      WHERE fecha >= date_trunc('week', CURRENT_DATE)
      GROUP BY TO_CHAR(fecha, 'Dy')
      ORDER BY MIN(fecha)
    `);
    // Convertir ventas a número
    const data = result.rows.map(r => ({
      name: r.name,
      ventas: Number(r.ventas)
    }));
    res.json(data);
  } catch (err) {
    console.error('❌ Error getVentasSemana:', err);
    res.status(500).json({ message: 'Error al obtener ventas de la semana' });
  }
};

module.exports = { createVenta, getVentas, getVentasSemana };
