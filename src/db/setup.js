import { readFile } from 'node:fs/promises'
import pool from '../config/db.js'

// npm run db:setup -> crea las tablas (schema.sql) y carga los datos de prueba (seed.sql)
async function correr(archivo){
  const sql = await readFile(new URL(archivo, import.meta.url), 'utf8')
  await pool.query(sql)
  console.log(`Listo: ${archivo}`)
}

try{
  await correr('schema.sql')
  await correr('seed.sql')
}catch(err){
  console.error('Error al preparar la base de datos:', err.message)
  process.exitCode = 1
}finally{
  await pool.end()
}
