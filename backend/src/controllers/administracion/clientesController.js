const db = require('../../config/db');

// =========================
// GET /api/clientes - Lista con JOIN a tipos_pago
// =========================
const getClientes = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, 
             tp.nombre AS tipo_pago_nombre, 
             tp.descripcion AS tipo_pago_desc
      FROM clientes c
      LEFT JOIN tipos_pago tp ON c.tipo_pago_id = tp.id
      ORDER BY c.codigo ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en getClientes:', error);
    res.status(500).json({ message: 'Error al obtener clientes' });
  }
};

// =========================
// 🔹 GET /api/clientes/credito - Clientes con tipo de pago "Crédito"
// =========================
const getClientesCredito = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, 
             tp.nombre AS tipo_pago_nombre, 
             tp.descripcion AS tipo_pago_desc
      FROM clientes c
      LEFT JOIN tipos_pago tp ON c.tipo_pago_id = tp.id
      WHERE LOWER(tp.nombre) = 'crédito' OR LOWER(tp.nombre) = 'credito'
      ORDER BY c.nombre ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en getClientesCredito:', error);
    res.status(500).json({ message: 'Error al obtener clientes con crédito' });
  }
};

// =========================
// 📊 GET /api/clientes/tipo-pago - Agrupar clientes por tipo de pago
// =========================
const getClientesPorTipoPago = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT tp.nombre AS tipo_pago, COUNT(c.id) AS cantidad
      FROM clientes c
      INNER JOIN tipos_pago tp ON c.tipo_pago_id = tp.id
      GROUP BY tp.nombre
      ORDER BY cantidad DESC;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en getClientesPorTipoPago:', error);
    res.status(500).json({ message: 'Error al obtener datos por tipo de pago' });
  }
};

// =========================
// POST /api/clientes - Crear cliente
// =========================
const createCliente = async (req, res) => {
  try {
    const {
      codigo,
      nombre,
      nit,
      direccion,
      pais,
      telefono,
      tipo_precio,
      tipo_pago_id,
      limite_credito,
      tiempo_credito,
    } = req.body;

    if (!codigo || !nombre || !tipo_pago_id || !tipo_precio) {
      return res.status(400).json({ message: 'Código, nombre, tipo de pago y tipo de precio son requeridos' });
    }

    if (!['publico', 'mayorista'].includes(tipo_precio)) {
      return res.status(400).json({ message: 'Tipo de precio debe ser "publico" o "mayorista"' });
    }

    const result = await db.query(
      `INSERT INTO clientes 
        (codigo, nombre, nit, direccion, pais, telefono, tipo_precio, tipo_pago_id, limite_credito, tiempo_credito, activo)
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
       RETURNING *`,
      [
        codigo.trim(),
        nombre.trim(),
        nit?.trim() || null,
        direccion?.trim() || null,
        pais?.trim() || null,
        telefono?.trim() || null,
        tipo_precio,
        parseInt(tipo_pago_id),
        parseFloat(limite_credito) || 0,
        parseInt(tiempo_credito) || 0
      ]
    );

    res.status(201).json({ message: 'Cliente creado exitosamente', cliente: result.rows[0] });
  } catch (error) {
    console.error('Error en createCliente:', error);
    if (error.code === '23505') return res.status(400).json({ message: 'Código o NIT ya existe' });
    if (error.code === '23503') return res.status(400).json({ message: 'Tipo de pago inválido' });
    res.status(500).json({ message: 'Error al crear cliente' });
  }
};

// =========================
// PUT /api/clientes/:id - Actualizar cliente
// =========================
const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      codigo,
      nombre,
      nit,
      direccion,
      pais,
      telefono,
      tipo_precio,
      tipo_pago_id,
      limite_credito,
      tiempo_credito,
      activo,
    } = req.body;

    if (!codigo || !nombre || !tipo_pago_id || !tipo_precio) {
      return res.status(400).json({ message: 'Código, nombre, tipo de pago y tipo de precio son requeridos' });
    }

    if (!['publico', 'mayorista'].includes(tipo_precio)) {
      return res.status(400).json({ message: 'Tipo de precio debe ser "publico" o "mayorista"' });
    }

    const checkResult = await db.query('SELECT id FROM clientes WHERE id = $1', [parseInt(id)]);
    if (checkResult.rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' });

    const result = await db.query(
      `UPDATE clientes SET
         codigo = $1,
         nombre = $2,
         nit = $3,
         direccion = $4,
         pais = $5,
         telefono = $6,
         tipo_precio = $7,
         tipo_pago_id = $8,
         limite_credito = $9,
         tiempo_credito = $10,
         activo = $11
       WHERE id = $12
       RETURNING *`,
      [
        codigo.trim(),
        nombre.trim(),
        nit?.trim() || null,
        direccion?.trim() || null,
        pais?.trim() || null,
        telefono?.trim() || null,
        tipo_precio,
        parseInt(tipo_pago_id),
        parseFloat(limite_credito) || 0,
        parseInt(tiempo_credito) || 0,
        activo !== undefined ? activo : true,
        parseInt(id),
      ]
    );

    res.json({ message: 'Cliente actualizado exitosamente', cliente: result.rows[0] });
  } catch (error) {
    console.error('Error en updateCliente:', error);
    if (error.code === '23505') return res.status(400).json({ message: 'Código o NIT ya existe' });
    if (error.code === '23503') return res.status(400).json({ message: 'Tipo de pago inválido' });
    res.status(500).json({ message: 'Error al actualizar cliente' });
  }
};

// =========================
// DELETE /api/clientes/:id
// =========================
const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [parseInt(id)]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error('Error en deleteCliente:', error);
    res.status(500).json({ message: 'Error al eliminar cliente' });
  }
};

module.exports = {
  getClientes,
  getClientesCredito,
  getClientesPorTipoPago, // ✅ nuevo endpoint para la gráfica
  createCliente,
  updateCliente,
  deleteCliente
};
