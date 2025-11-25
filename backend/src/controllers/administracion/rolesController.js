const db = require('../../config/db');  // Path correcto

// GET /api/admin/roles - Lista roles (solo columnas que existen: id y nombre)
const getRoles = async (req, res) => {
  try {
    // Query FIX: Solo id y nombre (sin descripcion para evitar error)
    const query = 'SELECT id, nombre FROM roles ORDER BY nombre';
    const result = await db.query(query);
    
    // Opcional: Agrega descripcion vacía si el frontend la espera (pero no es necesario)
    const rolesWithDesc = result.rows.map(rol => ({
      ...rol,
      descripcion: ''  // Fallback vacío si frontend lo usa
    }));
    
    res.json(rolesWithDesc);  // Array: [{id:1, nombre:'admin', descripcion:''}, ...]
  } catch (error) {
    console.error('Error en getRoles:', error);
    res.status(500).json({ message: 'Error al obtener roles' });
  }
};

module.exports = { getRoles };