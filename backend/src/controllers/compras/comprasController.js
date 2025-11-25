// Import pool con múltiples paths y validación robusta (desde src/controllers/compras/)
let pool = null;
const possiblePaths = [
  '../../../config/db',
  '../../../../config/db',
  '../../config/db',
  '../config/db'
];

for (const path of possiblePaths) {
  try {
    const imported = require(path);
    if (imported && typeof imported.query === 'function') {
      pool = imported;
      console.log(`✅ Pool DB cargado en comprasController desde path: ${path}`);
      break;
    } else {
      console.log(`⚠️ Path ${path} importado pero no es pool válido (no query function)`);
    }
  } catch (err) {
    console.log(`⚠️ Path ${path} falló al require: ${err.message}`);
  }
}

if (!pool) {
  console.error('❌ No se pudo cargar pool DB en comprasController. Verifica config/db.js y paths.');
  const createIngreso = (req, res) => res.status(500).json({ message: 'Pool DB no disponible - Verifica config/db.js' });
  const getCompras = (req, res) => res.status(500).json({ message: 'Pool DB no disponible - Verifica config/db.js' });
  const getCompraById = (req, res) => res.status(500).json({ message: 'Pool DB no disponible - Verifica config/db.js' });
  module.exports = { createIngreso, getCompras, getCompraById };
  return;
}

// Test pool
pool.query('SELECT 1 as test')
  .then(() => console.log('✅ Pool test OK en comprasController - Conexión activa'))
  .catch(err => console.error('❌ Pool test failed en comprasController:', err.message));

// ============================
// POST /api/compras/ingreso - Registrar ingreso mercadería
// ============================
const createIngreso = async (req, res) => {
  const { proveedor_id, items, total } = req.body;
  console.log('📥 POST /api/compras/ingreso recibido:', { proveedor_id, itemsCount: items.length, total });

  try {
    const proveedorCheck = await pool.query('SELECT id FROM proveedores WHERE id = $1', [proveedor_id]);
    if (proveedorCheck.rows.length === 0) {
      return res.status(400).json({ message: 'Proveedor no encontrado' });
    }

    const seqRes = await pool.query(
      "SELECT COALESCE(MAX(CAST(SUBSTRING(numero_factura FROM 6) AS INTEGER)), 0) + 1 AS next FROM compras WHERE numero_factura LIKE 'COMP-%'"
    );
    const nextNum = seqRes.rows[0].next.toString().padStart(3, '0');
    const numero_factura = `COMP-${nextNum}`;

    const compraRes = await pool.query(
      'INSERT INTO compras (numero_factura, proveedor_id, total) VALUES ($1, $2, $3) RETURNING id',
      [numero_factura, proveedor_id, total]
    );
    const compraId = compraRes.rows[0].id;

    for (const item of items) {
      const prodCheck = await pool.query('SELECT id FROM producto WHERE id = $1', [item.producto_id]);
      if (prodCheck.rows.length === 0) {
        return res.status(400).json({ message: `Producto ID ${item.producto_id} no encontrado` });
      }

      await pool.query(
        'INSERT INTO compras_detalle (compra_id, producto_id, cantidad, precio) VALUES ($1, $2, $3, $4)',
        [compraId, item.producto_id, item.cantidad, item.precio]
      );
    }

    console.log(`✅ Ingreso registrado ID ${compraId} (${numero_factura}) - Total: ${total}`);
    res.status(201).json({
      message: 'Ingreso registrado exitosamente',
      numero_factura,
      id: compraId,
      total
    });

  } catch (err) {
    console.error('❌ Error createIngreso - Code:', err.code || 'N/A');
    console.error('❌ Message:', err.message);
    res.status(500).json({ message: err.message || 'Error interno al registrar ingreso' });
  }
};

// ============================
// GET /api/compras - Listar ingresos
// ============================
const getCompras = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.numero_factura, c.total, c.fecha,
             COALESCE(p.codigo || ' - ' || p.nombre, 'Proveedor Desconocido') AS proveedor_nombre,
             tp.nombre AS tipo_pago
      FROM compras c
      LEFT JOIN proveedores p ON c.proveedor_id = p.id
      LEFT JOIN tipos_pago tp ON p.tipo_pago_id = tp.id
      ORDER BY c.fecha DESC
      LIMIT 50
    `);
    console.log(`📋 GET /api/compras: ${result.rows.length} ingresos`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error getCompras:', err.message);
    res.status(500).json({ message: 'Error al cargar ingresos' });
  }
};

// ============================
// GET /api/compras/:id - Ver detalle de compra
// ============================
const getCompraById = async (req, res) => {
  try {
    const { id } = req.params;
    const compra = await pool.query(
      `SELECT c.id, c.numero_factura, c.total, c.fecha,
              p.nombre AS proveedor_nombre, p.codigo AS proveedor_codigo,
              tp.nombre AS tipo_pago
       FROM compras c
       LEFT JOIN proveedores p ON c.proveedor_id = p.id
       LEFT JOIN tipos_pago tp ON p.tipo_pago_id = tp.id
       WHERE c.id = $1`,
      [id]
    );

    if (compra.rows.length === 0) {
      return res.status(404).json({ message: 'Compra no encontrada' });
    }

    const detalle = await pool.query(
      `SELECT d.id, pr.nombre AS producto, d.cantidad, d.precio,
              (d.cantidad * d.precio) AS subtotal
       FROM compras_detalle d
       LEFT JOIN producto pr ON d.producto_id = pr.id
       WHERE d.compra_id = $1`,
      [id]
    );

    res.json({
      ...compra.rows[0],
      detalles: detalle.rows
    });
  } catch (err) {
    console.error('❌ Error getCompraById:', err.message);
    res.status(500).json({ message: 'Error al cargar detalle de compra' });
  }
};

module.exports = { createIngreso, getCompras, getCompraById };
