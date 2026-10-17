import pool from '../config/db.js'

const EspacioModel = {
  async findAll(){
    const { rows } = await pool.query(
      'SELECT id, nombre, capacidad, ubicacion FROM espacios ORDER BY id'
    )
    return rows
  },

  async findById(id){
    const { rows } = await pool.query(
      'SELECT id, nombre, capacidad, ubicacion FROM espacios WHERE id = $1',
      [id]
    )
    return rows[0] || null
  },
}

export default EspacioModel
