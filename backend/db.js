// db.js
import pkg from 'pg';
const { Pool } = pkg;

// Usa SIEMPRE la variable DATABASE_URL en producción
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log("Conectado correctamente a la DB"))
  .catch(err => console.error("Error al conectar a la DB:", err));

export default pool;
