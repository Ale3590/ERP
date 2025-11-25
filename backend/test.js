// test.js
import pool from './db.js';

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW() AS current_time');
    console.log("✅ Conexión exitosa! Hora actual en DB:", res.rows[0].current_time);
  } catch (err) {
    console.error("⚠️ Error al ejecutar la consulta:", err);
  } finally {
    await pool.end(); // cerrar la conexión al finalizar
  }
}

testConnection();
