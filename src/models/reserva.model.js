import pool from '../config/db.js'

const COLUMNAS = 'id, espacio_id, responsable, inicio, fin, estado, version, actualizada'

const ReservaModel = {
  async findAll(){
    const { rows } = await pool.query(
      `SELECT ${COLUMNAS} FROM reservas ORDER BY inicio`
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
}

export default ReservaModel
