// backend/src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

let pool;

// Si Render detecta DATABASE_URL → usa Neon
if (process.env.DATABASE_URL) {
  console.log("🌐 Usando conexión a Neon (DATABASE_URL)");

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

} else {
  // Si no existe → usa la conexión local
  console.log("🖥️ Usando conexión local (.env)");

  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'BD_ERP',
    password: process.env.DB_PASSWORD || 'Admin',
    port: Number(process.env.DB_PORT) || 5432,
  });
}

// Logs
pool.on('connect', () => console.log('✅ Conexión DB establecida'));
pool.on('error', (err) => console.error('❌ Error pool DB:', err));

// Test al iniciar
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión inicial a DB OK');
    client.release();
  } catch (err) {
    console.error('❌ Error inicial conexión DB:', err.message);
  }
})();

module.exports = pool;
