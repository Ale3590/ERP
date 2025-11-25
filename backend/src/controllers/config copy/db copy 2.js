const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false, // 👈 Necesario para Neon
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => console.log('✅ Conexión DB establecida'));
pool.on('error', (err) => console.error('❌ Error pool DB:', err));

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
