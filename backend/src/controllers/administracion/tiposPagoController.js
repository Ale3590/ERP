const db = require('../../config/db');  // Corregido: Igual que en marcasController.js (desde administracion/ a src/config/db.js)

// GET /api/parametros/tipos-pago - lista todos
const getTiposPago = async (req, res) => {
  try {
    const result = await db.query('SELECT id, nombre, descripcion, activo FROM tipos_pago ORDER BY nombre ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error en getTiposPago:', error);
    res.status(500).json({ message: 'Error al obtener tipos de pago' });
  }
};

// POST /api/parametros/tipos-pago - crear nuevo
const createTipoPago = async (req, res) => {
  try {
    const { nombre, descripcion, activo } = req.body;
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ message: 'Nombre es requerido' });
    }

    const result = await db.query(
      'INSERT INTO tipos_pago (nombre, descripcion, activo) VALUES ($1, $2, $3) RETURNING *',
      [nombre.trim(), descripcion || '', activo !== undefined ? activo : true]
    );

    res.status(201).json({ message: 'Tipo de pago creado', tipoPago: result.rows[0] });
  } catch (error) {
    console.error('Error en createTipoPago:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ message: 'Tipo de pago ya existe' });
    }
    res.status(500).json({ message: 'Error al crear tipo de pago' });
  }
};

// PUT /api/parametros/tipos-pago/:id - actualizar
const updateTipoPago = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ message: 'Nombre es requerido' });
    }

    const result = await db.query(
      'UPDATE tipos_pago SET nombre = $1, descripcion = $2, activo = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [nombre.trim(), descripcion || '', activo !== undefined ? activo : true, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tipo de pago no encontrado' });
    }

    res.json({ message: 'Tipo de pago actualizado', tipoPago: result.rows[0] });
  } catch (error) {
    console.error('Error en updateTipoPago:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ message: 'Tipo de pago ya existe' });
    }
    res.status(500).json({ message: 'Error al actualizar tipo de pago' });
  }
};

// DELETE /api/parametros/tipos-pago/:id - eliminar
const deleteTipoPago = async (req, res) => {
  try {
    const { id } = req.params;

    // Opcional: Verificar si hay dependencias (e.g., ventas usando este tipo), pero por ahora simple delete
    const result = await db.query('DELETE FROM tipos_pago WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tipo de pago no encontrado' });
    }

    res.json({ message: 'Tipo de pago eliminado' });
  } catch (error) {
    console.error('Error en deleteTipoPago:', error);
    res.status(500).json({ message: 'Error al eliminar tipo de pago' });
  }
};

module.exports = { getTiposPago, createTipoPago, updateTipoPago, deleteTipoPago };