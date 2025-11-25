const db = require('../config/db');  // Ajusta path si necesario

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username y password requeridos' });
    }

    const query = `
      SELECT u.id, u.username, u.password, u.nombre, u.rol_id, u.activo, r.nombre as rol
      FROM usuario u
      JOIN roles r ON u.rol_id = r.id
      WHERE u.username = $1 AND u.password = $2 AND u.activo = true
    `;
    const result = await db.query(query, [username, password]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = result.rows[0];
    const token = `token_dummy_${user.id}_${Date.now()}`;

    // NUEVO: Obtén permisos del rol del user (nombres para fácil chequeo en frontend)
    const permisosQuery = `
      SELECT p.nombre 
      FROM permisos p
      JOIN role_permisos rp ON p.id = rp.permiso_id
      WHERE rp.rol_id = $1
    `;
    const permisosResult = await db.query(permisosQuery, [user.rol_id]);
    const permisos = permisosResult.rows.map(row => row.nombre);  // Array: ['ver_ventas', 'crear_compras']

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        rol: user.rol,
        rol_id: user.rol_id,
        activo: user.activo,
        permisos: permisos  // NUEVO: Array de permisos (ej. ['ver_ventas'])
      },
      message: 'Login exitoso'
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

module.exports = { login };