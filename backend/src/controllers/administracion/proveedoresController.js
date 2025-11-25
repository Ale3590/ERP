const db = require('../../config/db');  // Path correcto

// GET /api/proveedores - Lista simple
const getProveedores = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, tp.nombre AS tipo_pago
      FROM proveedores p
      LEFT JOIN tipos_pago tp ON p.tipo_pago_id = tp.id
      ORDER BY p.codigo ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en getProveedores:', error);
    res.status(500).json({ message: 'Error al obtener proveedores' });
  }
};

// POST /api/proveedores - Crear
const createProveedor = async (req, res) => {
  try {
    const { codigo, nombre, nit, direccion, telefono, correo, tipo_pago_id } = req.body;

    if (!codigo || !nombre || !tipo_pago_id) {
      return res.status(400).json({ message: 'Código, nombre y tipo de pago son requeridos' });
    }

    const result = await db.query(
      `INSERT INTO proveedores 
       (codigo, nombre, nit, direccion, telefono, correo, tipo_pago_id, activo) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING *`,
      [codigo.trim(), nombre.trim(), nit?.trim() || null, direccion?.trim() || null,
       telefono?.trim() || null, correo?.trim() || null, tipo_pago_id]
    );

    res.status(201).json({ message: 'Proveedor creado exitosamente', proveedor: result.rows[0] });
  } catch (error) {
    console.error('Error en createProveedor:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Código o NIT ya existe' });
    }
    res.status(500).json({ message: 'Error al crear proveedor' });
  }
};

// PUT /api/proveedores/:id - Actualizar
const updateProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nombre, nit, direccion, telefono, correo, tipo_pago_id, activo } = req.body;

    if (!codigo || !nombre || !tipo_pago_id) {
      return res.status(400).json({ message: 'Código, nombre y tipo de pago son requeridos' });
    }

    const checkResult = await db.query('SELECT id FROM proveedores WHERE id = $1', [parseInt(id)]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    const result = await db.query(
      `UPDATE proveedores SET 
        codigo = $1, nombre = $2, nit = $3, direccion = $4, telefono = $5, 
        correo = $6, tipo_pago_id = $7, activo = $8
       WHERE id = $9 RETURNING *`,
      [codigo.trim(), nombre.trim(), nit?.trim() || null, direccion?.trim() || null,
       telefono?.trim() || null, correo?.trim() || null, tipo_pago_id, activo !== undefined ? activo : true, parseInt(id)]
    );

    res.json({ message: 'Proveedor actualizado exitosamente', proveedor: result.rows[0] });
  } catch (error) {
    console.error('Error en updateProveedor:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Código o NIT ya existe' });
    }
    res.status(500).json({ message: 'Error al actualizar proveedor' });
  }
};

// DELETE /api/proveedores/:id
const deleteProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM proveedores WHERE id = $1 RETURNING *', [parseInt(id)]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    res.json({ message: 'Proveedor eliminado exitosamente' });
  } catch (error) {
    console.error('Error en deleteProveedor:', error);
    res.status(500).json({ message: 'Error al eliminar proveedor' });
  }
};

module.exports = { getProveedores, createProveedor, updateProveedor, deleteProveedor };
