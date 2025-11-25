const db = require('../../config/db');  // Path correcto

// GET /api/admin/usuarios - Lista usuarios (con roles)
const getUsuarios = async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.username, u.nombre, u.activo, r.nombre as rol_nombre, r.id as rol_id
      FROM usuario u
      JOIN roles r ON u.rol_id = r.id
      ORDER BY u.nombre
    `;
    const result = await db.query(query);
    res.json(result.rows);  // Array: [{id:1, username:'admin', nombre:'Admin', activo:true, rol_nombre:'admin', rol_id:1}, ...]
  } catch (error) {
    console.error('Error en getUsuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// POST /api/admin/usuarios - Crear usuario nuevo
const createUsuario = async (req, res) => {
  try {
    const { username, password, nombre, rol_id } = req.body;

    if (!username || !password || !nombre || !rol_id) {
      return res.status(400).json({ message: 'Faltan campos requeridos: username, password, nombre, rol_id' });
    }

    const query = `
      INSERT INTO usuario (username, password, nombre, rol_id, activo)
      VALUES ($1, $2, $3, $4, true)
      RETURNING id, username, nombre, activo, rol_id
    `;
    const result = await db.query(query, [username, password, nombre, parseInt(rol_id)]);

    res.status(201).json({ 
      message: 'Usuario creado exitosamente', 
      usuario: result.rows[0] 
    });
  } catch (error) {
    console.error('Error en createUsuario:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Username ya existe. Elige otro.' });
    } else if (error.code === '23503') {
      return res.status(400).json({ message: 'Rol inválido. Verifica el ID del rol.' });
    }
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

// PUT /api/admin/usuarios/:id - Actualizar usuario (password opcional)
const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, nombre, rol_id, activo } = req.body;

    if (!username || !nombre || !rol_id) {
      return res.status(400).json({ message: 'Faltan campos requeridos: username, nombre, rol_id' });
    }

    // Query dinámica: Si password viene, incluye; sino, no lo actualiza
    let query = `
      UPDATE usuario 
      SET username = $1, nombre = $2, rol_id = $3, activo = $4
    `;
    const params = [username, nombre, parseInt(rol_id), activo !== undefined ? activo : true];

    if (password) {
      query += ', password = $' + params.length;
      params.push(password);
    }

    query += ` WHERE id = $${params.length}`;
    params.push(parseInt(id));

    const result = await db.query(query, params);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Retorna user actualizado (refetch para rol_nombre)
    const userQuery = `
      SELECT u.id, u.username, u.nombre, u.activo, r.nombre as rol_nombre, r.id as rol_id
      FROM usuario u JOIN roles r ON u.rol_id = r.id WHERE u.id = $1
    `;
    const userResult = await db.query(userQuery, [id]);

    res.json({ 
      message: 'Usuario actualizado exitosamente', 
      usuario: userResult.rows[0] 
    });
  } catch (error) {
    console.error('Error en updateUsuario:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Username ya existe. Elige otro.' });
    } else if (error.code === '23503') {
      return res.status(400).json({ message: 'Rol inválido. Verifica el ID del rol.' });
    }
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

// DELETE /api/admin/usuarios/:id - Eliminar usuario
const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Primero, chequea si existe
    const checkQuery = 'SELECT id FROM usuario WHERE id = $1';
    const checkResult = await db.query(checkQuery, [parseInt(id)]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // DELETE directo (o soft: UPDATE activo=false si prefieres)
    const query = 'DELETE FROM usuario WHERE id = $1';
    const result = await db.query(query, [parseInt(id)]);

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error en deleteUsuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};

module.exports = { getUsuarios, createUsuario, updateUsuario, deleteUsuario };