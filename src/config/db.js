import pg from 'pg'
import 'dotenv/config'

// Neon es PostgreSQL: se conecta con el Pool de "pg" usando la cadena de conexion
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

pool.on('error', (err) => {
  console.error('Error en el pool de PostgreSQL:', err)
})

export default pool
