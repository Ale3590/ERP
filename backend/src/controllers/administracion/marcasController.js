const db = require('../../config/db');  // Corregido: Mismo path que en parametrosController.js (desde administracion/ a src/config/db.js)

// --- FUNCIONES PARA MARCAS ---

// GET /api/parametros/marcas - Lista todas las marcas (ordenadas por nombre)
const getMarcas = async (req, res) => {
  try {
    const result = await db.query('SELECT id, nombre, activo FROM marcas ORDER BY nombre ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error en getMarcas:', error);
    res.status(500).json({ message: 'Error al obtener marcas' });
  }
};

// POST /api/parametros/marcas - Crear nueva marca (activo default true)
const createMarca = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ message: 'Nombre es requerido' });
    }

    const result = await db.query(
      'INSERT INTO marcas (nombre, activo) VALUES ($1, true) RETURNING *',
      [nombre.trim()]
    );

    res.status(201).json({ 
      message: 'Marca creada exitosamente', 
      marca: result.rows[0] 
    });
  } catch (error) {
    console.error('Error en createMarca:', error);
    if (error.code === '23505') {  // Unique violation en nombre
      return res.status(400).json({ message: 'Nombre de marca ya existe' });
    }
    res.status(500).json({ message: 'Error al crear marca' });
  }
};

// PUT /api/parametros/marcas/:id - Actualizar marca (nombre requerido, activo opcional)
const updateMarca = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, activo } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ message: 'Nombre es requerido' });
    }

    // Chequea si existe antes de actualizar
    const checkQuery = 'SELECT id FROM marcas WHERE id = $1';
    const checkResult = await db.query(checkQuery, [parseInt(id)]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Marca no encontrada' });
    }

    const result = await db.query(
      'UPDATE marcas SET nombre = $1, activo = $2 WHERE id = $3 RETURNING *',
      [nombre.trim(), activo !== undefined ? activo : true, parseInt(id)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Marca no encontrada' });
    }

    res.json({ 
      message: 'Marca actualizada exitosamente', 
      marca: result.rows[0] 
    });
  } catch (error) {
    console.error('Error en updateMarca:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Nombre de marca ya existe' });
    }
    res.status(500).json({ message: 'Error al actualizar marca' });
  }
};

// DELETE /api/parametros/marcas/:id - Eliminar marca (sin chequeo de dependencias por DROP de marca en producto)
const deleteMarca = async (req, res) => {
  try {
    const { id } = req.params;
    const marcaId = parseInt(id);

    // Chequea si existe
    const checkQuery = 'SELECT id FROM marcas WHERE id = $1';
    const checkResult = await db.query(checkQuery, [marcaId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Marca no encontrada' });
    }

    // Opcional: Si más adelante agregas foreign key en producto.marca_id, descomenta y ajusta:
    // const prodCheckQuery = 'SELECT COUNT(*) as count FROM producto WHERE marca_id = $1';
    // const prodResult = await db.query(prodCheckQuery, [marcaId]);
    // const prodCount = parseInt(prodResult.rows[0].count);
    // if (prodCount > 0) {
    //   return res.status(400).json({ message: `No se puede eliminar. Hay ${prodCount} productos asociados.` });
    // }

    const result = await db.query('DELETE FROM marcas WHERE id = $1 RETURNING *', [marcaId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Marca no encontrada' });
    }

    res.json({ message: 'Marca eliminada exitosamente' });
  } catch (error) {
    console.error('Error en deleteMarca:', error);
    res.status(500).json({ message: 'Error al eliminar marca' });
  }
};

module.exports = { getMarcas, createMarca, updateMarca, deleteMarca };