import EspacioModel from '../models/espacio.model.js'
import ReservaModel from '../models/reserva.model.js'
import { HttpError } from '../middlewares/errorHandler.js'
import { idValido, fechaValida } from './validar.js'

const EspaciosController = {
  // GET /api/espacios
  async getAll(req, res){
    const espacios = await EspacioModel.findAll()
    res.json({ success: true, data: espacios })
  },

  // GET /api/espacios/:id
  async getById(req, res){
    const espacio = await EspacioModel.findById(idValido(req.params.id))
    if (!espacio) throw new HttpError(404, 'Espacio no encontrado')
    res.json({ success: true, data: espacio })
  },

  // GET /api/espacios/:id/reservas?fecha=YYYY-MM-DD -> horarios ocupados ese dia
  async getDisponibilidad(req, res){
    const id = idValido(req.params.id)
    const fecha = fechaValida(req.query.fecha)

    const espacio = await EspacioModel.findById(id)
    if (!espacio) throw new HttpError(404, 'Espacio no encontrado')

    const reservas = await ReservaModel.findByEspacioYFecha(id, fecha)
    res.json({ success: true, data: { espacio, fecha, reservas } })
  },
}

export default EspaciosController
