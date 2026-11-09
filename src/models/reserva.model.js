// MODELO DE RESERVAS: solo consultas SQL a la tabla reservas
// aqui esta el bloqueo optimista (ver update y cancel)
import pool from '../config/db.js'

// columnas que se devuelven en cada consulta
const COLUMNAS = 'id, espacio_id, responsable, inicio, fin, estado, version, actualizada'

const ReservaModel = {
  // lista de la pantalla Reservas: con JOIN trae tambien el nombre del espacio
  async findAll(){
    const { rows } = await pool.query(
      `SELECT r.id, r.espacio_id, e.nombre AS espacio_nombre, r.responsable,
              r.inicio, r.fin, r.estado, r.version, r.actualizada
         FROM reservas r
         JOIN espacios e ON e.id = r.espacio_id
        ORDER BY r.inicio`
    )
    return rows
  },

  async findById(id){
    const { rows } = await pool.query(
      `SELECT ${COLUMNAS} FROM reservas WHERE id = $1`,
      [id]
    )
    return rows[0] || null
  },

  // reservas activas de un espacio que tocan el dia indicado (hora de Colombia)
  async findByEspacioYFecha(espacioId, fecha){
    const { rows } = await pool.query(
      `SELECT ${COLUMNAS}
         FROM reservas
        WHERE espacio_id = $1
          AND estado = 'activa'
          AND tstzrange(inicio, fin) && tstzrange(
                $2::date::timestamp AT TIME ZONE 'America/Bogota',
                ($2::date + 1)::timestamp AT TIME ZONE 'America/Bogota'
              )
        ORDER BY inicio`,
      [espacioId, fecha]
    )
    return rows
  },

  // si el horario se cruza, PostgreSQL lanza 23P01 y el errorHandler responde 409
  async create({ espacio_id, responsable, inicio, fin }){
    const { rows } = await pool.query(
      `INSERT INTO reservas (espacio_id, responsable, inicio, fin)
       VALUES ($1, $2, $3, $4)
       RETURNING ${COLUMNAS}`,
      [espacio_id, responsable, inicio, fin]
    )
    return rows[0]
  },

  // bloqueo optimista: solo actualiza si la version que manda el cliente sigue igual
  // la version sube sola con el trigger reservas_subir_version (ver schema.sql)
  // devuelve null si no actualizo nada: no existe, esta cancelada o la version cambio
  async update(id, version, { responsable, inicio, fin }){
    const { rows } = await pool.query(
      `UPDATE reservas
          SET responsable = $3, inicio = $4, fin = $5
        WHERE id = $1 AND version = $2 AND estado = 'activa'
       RETURNING ${COLUMNAS}`,
      [id, version, responsable, inicio, fin]
    )
    return rows[0] || null
  },

  // cancelar tambien usa la version, igual que update
  async cancel(id, version){
    const { rows } = await pool.query(
      `UPDATE reservas
          SET estado = 'cancelada'
        WHERE id = $1 AND version = $2 AND estado = 'activa'
       RETURNING ${COLUMNAS}`,
      [id, version]
    )
    return rows[0] || null
  },
}

export default ReservaModel
