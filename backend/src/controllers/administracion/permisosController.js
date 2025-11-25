const db = require('../../config/db');  // Path correcto

// GET /api/admin/permisos - Lista todos los permisos disponibles (para checkboxes en frontend)
const getPermisos = async (req, res) => {
  try {
    const query = 'SELECT id, nombre, descripcion, modulo FROM permisos ORDER BY modulo, nombre';
    const result = await db.query(query);
    res.json(result.rows);  // Array: [{id:1, nombre:'ver_ventas', descripcion:'...', modulo:'ventas'}, ...]
  } catch (error) {
    console.error('Error en getPermisos:', error);
    res.status(500).json({ message: 'Error al obtener permisos' });
  }
};

// GET /api/admin/roles/:id/permisos - Obtiene permisos de un rol específico (con flag 'asignado' para checkboxes)
const getPermisosPorRol = async (req, res) => {
  try {
    const rolId = req.params.id;
    const query = `
      SELECT p.*, 
             CASE WHEN rp.rol_id IS NOT NULL THEN true ELSE false END as asignado
      FROM permisos p
      LEFT JOIN role_permisos rp ON p.id = rp.permiso_id AND rp.rol_id = $1
      ORDER BY p.modulo, p.nombre
    `;
    const result = await db.query(query, [rolId]);
    res.json(result.rows);  // Array: [{id:1, nombre:'ver_ventas', asignado: true}, ...]
  } catch (error) {
    console.error('Error en getPermisosPorRol:', error);
    res.status(500).json({ message: 'Error al obtener permisos del rol' });
  }
};

// PUT /api/admin/roles/:id/permisos - Actualiza permisos de un rol (recibe array de permiso_ids seleccionados)
const updatePermisosRol = async (req, res) => {
  try {
    const rolId = req.params.id;
    const { permiso_ids } = req.body;  // Array ej. [1, 3, 5] (IDs de permisos checked)

    // 1. Borra todos los permisos actuales del rol
    await db.query('DELETE FROM role_permisos WHERE rol_id = $1', [rolId]);

    // 2. Inserta los nuevos seleccionados (si hay)
    if (permiso_ids && permiso_ids.length > 0) {
      const placeholders = permiso_ids.map((_, index) => `($1, $${index + 2})`).join(', ');
      const values = [rolId, ...permiso_ids];
      await db.query(`INSERT INTO role_permisos (rol_id, permiso_id) VALUES ${placeholders}`, values);
    }

    res.json({ message: 'Permisos actualizados exitosamente para el rol' });
  } catch (error) {
    console.error('Error en updatePermisosRol:', error);
    res.status(500).json({ message: 'Error al actualizar permisos' });
  }
};

module.exports = { getPermisos, getPermisosPorRol, updatePermisosRol };