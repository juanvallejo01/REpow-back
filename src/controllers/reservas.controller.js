import ReservaModel from '../models/reserva.model.js'
import { HttpError } from '../middlewares/errorHandler.js'
import { idValido, fechaHoraValida } from './validar.js'

const ReservasController = {
  // GET /api/reservas
  async getAll(req, res){
    const reservas = await ReservaModel.findAll()
    res.json({ success: true, data: reservas })
  },

  // GET /api/reservas/:id
  async getById(req, res){
    const reserva = await ReservaModel.findById(idValido(req.params.id))
    if (!reserva) throw new HttpError(404, 'Reserva no encontrada')
    res.json({ success: true, data: reserva })
  },

  // POST /api/reservas -> 201 | 400 datos invalidos | 404 espacio no existe | 409 horario ocupado
  async create(req, res){
    const { espacio_id, responsable, inicio, fin } = req.body ?? {}

    if (typeof responsable !== 'string' || !responsable.trim()) {
      throw new HttpError(400, 'El responsable es requerido')
    }

    const reserva = await ReservaModel.create({
      espacio_id: idValido(espacio_id, 'espacio_id'),
      responsable: responsable.trim(),
      inicio: fechaHoraValida(inicio, 'inicio'),
      fin: fechaHoraValida(fin, 'fin'),
    })
    res.status(201).json({ success: true, data: reserva })
  },
}

export default ReservasController
