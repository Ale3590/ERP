// db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_N5tPdS6xheDg@ep-dark-truth-a4j1ny8a-pooler.us-east-1.aws.neon.tech/neondb',
  ssl: {
    rejectUnauthorized: false // necesario para Neon
  }
});

pool.connect()
  .then(() => console.log("✅ Conectado a Neon DB desde Node.js!"))
  .catch(err => console.error("⚠️ Error al conectar a la DB:", err));

export default pool;
