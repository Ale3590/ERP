const db = require('../../config/db');  // Asegúrate de que este path sea correcto a tu config/db.js

// --- FUNCIONES PARA CATEGORÍAS ---

// GET /api/parametros/categorias - Lista categorías (con query param activo)
const getCategorias = async (req, res) => {
  try {
    const { activo } = req.query;
    const whereClause = activo === 'true' ? 'WHERE activo = true' : '';
    const query = `
      SELECT id, nombre, descripcion, activo, created_at
      FROM categoria 
      ${whereClause}
      ORDER BY nombre ASC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en getCategorias:', error);
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
};

// POST /api/parametros/categorias - Crear categoría
const createCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ message: 'Nombre es requerido' });
    }

    const query = `
      INSERT INTO categoria (nombre, descripcion, activo)
      VALUES ($1, $2, true)
      RETURNING *
    `;
    const values = [nombre.trim(), descripcion || null];
    const result = await db.query(query, values);

    res.status(201).json({ 
      message: 'Categoría creada exitosamente', 
      categoria: result.rows[0] 
    });
  } catch (error) {
    console.error('Error en createCategoria:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Nombre de categoría ya existe' });
    }
    res.status(500).json({ message: 'Error al crear categoría' });
  }
};

// PUT /api/parametros/categorias/:id - Actualizar categoría
const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ message: 'Nombre es requerido' });
    }

    let params = [];
    let setClauses = [];

    setClauses.push('nombre = $1');
    params.push(nombre.trim());

    let paramIndex = 2;

    if (descripcion !== undefined) {
      setClauses.push(`descripcion = $${paramIndex}`);
      params.push(descripcion || null);
      paramIndex++;
    }
    if (activo !== undefined) {
      setClauses.push(`activo = $${paramIndex}`);
      params.push(activo);
      paramIndex++;
    }

    params.push(parseInt(id));

    const query = `
      UPDATE categoria 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, params);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.json({ 
      message: 'Categoría actualizada exitosamente', 
      categoria: result.rows[0] 
    });
  } catch (error) {
    console.error('Error en updateCategoria:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Nombre de categoría ya existe' });
    }
    res.status(500).json({ message: 'Error al actualizar categoría' });
  }
};

// DELETE /api/parametros/categorias/:id - Eliminar categoría (chequea productos)
const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const catId = parseInt(id);

    const checkQuery = 'SELECT id FROM categoria WHERE id = $1';
    const checkResult = await db.query(checkQuery, [catId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    const prodCheckQuery = `
      SELECT COUNT(*) as count 
      FROM producto 
      WHERE categoria = (SELECT nombre FROM categoria WHERE id = $1)
    `;
    const prodResult = await db.query(prodCheckQuery, [catId]);
    const prodCount = parseInt(prodResult.rows[0].count);

    if (prodCount > 0) {
      return res.status(400).json({ message: `No se puede eliminar. Hay ${prodCount} productos asociados.` });
    }

    const query = 'DELETE FROM categoria WHERE id = $1';
    const result = await db.query(query, [catId]);

    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error en deleteCategoria:', error);
    res.status(500).json({ message: 'Error al eliminar categoría' });
  }
};

// --- FUNCIONES PARA PRODUCTOS ---

// GET /api/parametros/productos - Lista productos
const getProductos = async (req, res) => {
  try {
    const query = `
      SELECT id, codigo, nombre, marca, categoria, existencia_minima,
             fecha_oferta_inicio, fecha_oferta_fin, precio_publico, precio_mayorista,
             precio_oferta_publico, precio_oferta_mayorista, inactivo
      FROM producto
      ORDER BY nombre ASC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en getProductos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

// POST /api/parametros/productos - Crear producto
const createProducto = async (req, res) => {
  try {
    const { codigo, nombre, marca, categoria, existencia_minima, 
            fecha_oferta_inicio, fecha_oferta_fin, 
            precio_publico, precio_mayorista, precio_oferta_publico, precio_oferta_mayorista } = req.body;

    if (!codigo || codigo.trim() === '' || !nombre || nombre.trim() === '') {
      return res.status(400).json({ message: 'Código y nombre son requeridos' });
    }

    if ((existencia_minima && existencia_minima < 0) || 
        (precio_publico && precio_publico < 0) || (precio_mayorista && precio_mayorista < 0) ||
        (precio_oferta_publico && precio_oferta_publico < 0) || (precio_oferta_mayorista && precio_oferta_mayorista < 0)) {
      return res.status(400).json({ message: 'Existencia mínima y precios deben ser >= 0' });
    }

    const query = `
      INSERT INTO producto (
        codigo, nombre, marca, categoria, existencia_minima,
        fecha_oferta_inicio, fecha_oferta_fin,
        precio_publico, precio_mayorista, precio_oferta_publico, precio_oferta_mayorista,
        inactivo
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false)
      RETURNING *
    `;
    const values = [
      codigo.trim(), nombre.trim(), marca || null, categoria || 'General',
      parseInt(existencia_minima) || 0,
      fecha_oferta_inicio || null, fecha_oferta_fin || null,
      parseFloat(precio_publico) || null, parseFloat(precio_mayorista) || null,
      parseFloat(precio_oferta_publico) || null, parseFloat(precio_oferta_mayorista) || null
    ];
    const result = await db.query(query, values);

    res.status(201).json({ 
      message: 'Producto creado exitosamente', 
      producto: result.rows[0] 
    });
  } catch (error) {
    console.error('Error en createProducto:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Código de producto ya existe. Elige otro.' });
    }
    res.status(500).json({ message: 'Error al crear producto' });
  }
};

// PUT /api/parametros/productos/:id - Actualizar producto
const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nombre, marca, categoria, existencia_minima, 
            fecha_oferta_inicio, fecha_oferta_fin, 
            precio_publico, precio_mayorista, precio_oferta_publico, precio_oferta_mayorista, inactivo } = req.body;

    if (!codigo || codigo.trim() === '' || !nombre || nombre.trim() === '') {
      return res.status(400).json({ message: 'Código y nombre son requeridos' });
    }

    if ((existencia_minima && existencia_minima < 0) || 
        (precio_publico && precio_publico < 0) || (precio_mayorista && precio_mayorista < 0) ||
        (precio_oferta_publico && precio_oferta_publico < 0) || (precio_oferta_mayorista && precio_oferta_mayorista < 0)) {
      return res.status(400).json({ message: 'Existencia mínima y precios deben ser >= 0' });
    }

    let params = [];
    let setClauses = [];

    setClauses.push('codigo = $1');
    params.push(codigo.trim());
    setClauses.push('nombre = $2');
    params.push(nombre.trim());

    let paramIndex = 3;

    if (marca !== undefined) {
      setClauses.push(`marca = $${paramIndex}`);
      params.push(marca || null);
      paramIndex++;
    }
    if (categoria !== undefined) {
      setClauses.push(`categoria = $${paramIndex}`);
      params.push(categoria || 'General');
      paramIndex++;
    }
    if (existencia_minima !== undefined) {
      setClauses.push(`existencia_minima = $${paramIndex}`);
      params.push(parseInt(existencia_minima) || 0);
      paramIndex++;
    }
    if (fecha_oferta_inicio !== undefined) {
      setClauses.push(`fecha_oferta_inicio = $${paramIndex}`);
      params.push(fecha_oferta_inicio || null);
      paramIndex++;
    }
    if (fecha_oferta_fin !== undefined) {
      setClauses.push(`fecha_oferta_fin = $${paramIndex}`);
      params.push(fecha_oferta_fin || null);
      paramIndex++;
    }
    if (precio_publico !== undefined) {
      setClauses.push(`precio_publico = $${paramIndex}`);
      params.push(parseFloat(precio_publico) || null);
      paramIndex++;
    }
    if (precio_mayorista !== undefined) {
      setClauses.push(`precio_mayorista = $${paramIndex}`);
      params.push(parseFloat(precio_mayorista) || null);
      paramIndex++;
    }
    if (precio_oferta_publico !== undefined) {
      setClauses.push(`precio_oferta_publico = $${paramIndex}`);
      params.push(parseFloat(precio_oferta_publico) || null);
      paramIndex++;
    }
    if (precio_oferta_mayorista !== undefined) {
      setClauses.push(`precio_oferta_mayorista = $${paramIndex}`);
      params.push(parseFloat(precio_oferta_mayorista) || null);
      paramIndex++;
    }
    setClauses.push(`inactivo = $${paramIndex}`);
    params.push(inactivo !== undefined ? inactivo : false);
    paramIndex++;

    params.push(parseInt(id));

    const query = `
      UPDATE producto 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, params);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ 
      message: 'Producto actualizado exitosamente', 
      producto: result.rows[0] 
    });
  } catch (error) {
    console.error('Error en updateProducto:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Código de producto ya existe. Elige otro.' });
    }
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

// DELETE /api/parametros/productos/:id - Eliminar producto (chequeo ventas comentado)
const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const prodId = parseInt(id);

    const checkQuery = 'SELECT id FROM producto WHERE id = $1';
    const checkResult = await db.query(checkQuery, [prodId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Chequeo ventas comentado (descomenta cuando tengas tabla facturacion)
    // const ventasCheckQuery = 'SELECT COUNT(*) as count FROM facturacion WHERE producto_id = $1';
    // const ventasResult = await db.query(ventasCheckQuery, [prodId]);
    // const ventasCount = parseInt(ventasResult.rows[0].count);
    // if (ventasCount > 0) {
    //   return res.status(400).json({ message: `No se puede eliminar. Hay ${ventasCount} ventas asociadas.` });
    // }

    const query = 'DELETE FROM producto WHERE id = $1';
    const result = await db.query(query, [prodId]);

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error en deleteProducto:', error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};

// EXPORT COMPLETO (todas funciones)
module.exports = {
  getCategorias, createCategoria, updateCategoria, deleteCategoria,
  getProductos, createProducto, updateProducto, deleteProducto
};