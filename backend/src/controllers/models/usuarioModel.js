const db = require('../config/db');

// Obtener todos los usuarios con su rol
const getUsuarios = async () => {
  const query = `
    SELECT u.id, u.username, u.nombre, u.activo, r.nombre as rol_nombre, r.id as rol_id
    FROM usuario u
    JOIN roles r ON u.rol_id = r.id
    ORDER BY u.nombre
  `;
  const result = await db.query(query);
  return result.rows;
};

// Crear un nuevo usuario (lo necesitarás para el form de CrearUsuario)
const createUsuario = async (username, password, nombre, rol_id) => {
  const query = `
    INSERT INTO usuario (username, password, nombre, rol_id, activo)
    VALUES ($1, $2, $3, $4, true)
    RETURNING id, username, nombre, activo
  `;
  const result = await db.query(query, [username, password, nombre, rol_id]); // Nota: En prod, hashea la password con bcrypt
  return result.rows[0];
};

module.exports = { getUsuarios, createUsuario };
