// test-db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://usuario:contraseña@ep-something.neon.tech/tu_base_de_datos',
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const res = await pool.query('SELECT now() AS now');
    console.log('Conexión OK:', res.rows);
    await pool.end();
  } catch (err) {
    console.error('Error conexión:', err);
  }
})();
