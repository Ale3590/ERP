// backend/src/controllers/config/db.js
const { Pool } = require('pg');
require('dotenv').config(); // Carga variables del .env

// Pool de conexiones
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'BD_ERP',
  password: process.env.DB_PASSWORD || 'Admin',
  port: Number(process.env.DB_PORT) || 5432,
  max: 20,               // Máximo de conexiones
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // 5 segundos para conectar
});

// Logs de pool
pool.on('connect', () => console.log('✅ Nueva conexión DB establecida'));
pool.on('error', (err) => console.error('❌ Error pool DB:', err));

// Test de conexión al iniciar
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión inicial a DB exitosa');
    client.release();
  } catch (err) {
    console.error('❌ Error inicial conexión DB:', err.message);
  }
})();

module.exports = pool;
