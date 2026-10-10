import pg from 'pg'
import 'dotenv/config'

// PostgreSQL local (la misma base que se abre en DBeaver)
const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

pool.on('error', (err) => {
  console.error('Error en el pool de PostgreSQL:', err)
})

export default pool
