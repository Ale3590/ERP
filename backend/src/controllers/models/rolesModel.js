const db = require('../config/db'); // Ajusta la ruta si es necesario

// Obtener todos los roles
const getRoles = async () => {
  const query = 'SELECT * FROM roles ORDER BY nombre';
  const result = await db.query(query);
  return result.rows;
};

// Obtener rol por ID (opcional, para validaciones)
const getRolById = async (id) => {
  const query = 'SELECT * FROM roles WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rows[0];
};

module.exports = { getRoles, getRolById };