import ReservaModel from '../models/reserva.model.js'
import { HttpError } from '../middlewares/errorHandler.js'
import { idValido, fechaHoraValida, versionDeIfMatch } from './validar.js'

// la version de cada reserva viaja en el header ETag, ej: ETag: "3"
function responderReserva(res, status, reserva){
  res.set('ETag', `"${reserva.version}"`)
  res.status(status).json({ success: true, data: reserva })
}

// valida los campos que se pueden escribir al crear o editar
function leerDatos(body){
  const { responsable, inicio, fin } = body ?? {}

  if (typeof responsable !== 'string' || !responsable.trim()) {
    throw new HttpError(400, 'El responsable es requerido')
  }

  return {
    responsable: responsable.trim(),
    inicio: fechaHoraValida(inicio, 'inicio'),
    fin: fechaHoraValida(fin, 'fin'),
  }
}

// cuando el UPDATE no cambio ninguna fila, se averigua por que
async function responderFallo(res, id){
  const actual = await ReservaModel.findById(id)
  if (!actual) throw new HttpError(404, 'Reserva no encontrada')
  if (actual.estado === 'cancelada') throw new HttpError(409, 'La reserva ya esta cancelada')

  // la version cambio: otra persona guardo primero
  // se manda la reserva actual para que el front le muestre al usuario que cambio
  res.set('ETag', `"${actual.version}"`)
  res.status(412).json({
    success: false,
    message: 'La reserva fue modificada por otra persona',
    data: actual,
  })
}

const ReservasController = {
  // GET /api/reservas
  async getAll(req, res){
    const reservas = await ReservaModel.findAll()
    res.json({ success: true, data: reservas })
  },

  // GET /api/reservas/:id -> 200 + ETag
  async getById(req, res){
    const reserva = await ReservaModel.findById(idValido(req.params.id))
    if (!reserva) throw new HttpError(404, 'Reserva no encontrada')
    responderReserva(res, 200, reserva)
  },

  // POST /api/reservas -> 201 + ETag | 400 datos invalidos | 404 espacio no existe | 409 horario ocupado
  async create(req, res){
    const reserva = await ReservaModel.create({
      espacio_id: idValido(req.body?.espacio_id, 'espacio_id'),
      ...leerDatos(req.body),
    })
    responderReserva(res, 201, reserva)
  },

  // PUT /api/reservas/:id  (header If-Match) -> 200 + ETag nuevo | 412 version vieja | 409 horario ocupado
  async update(req, res){
    const id = idValido(req.params.id)
    const version = versionDeIfMatch(req)

    const reserva = await ReservaModel.update(id, version, leerDatos(req.body))
    if (!reserva) return responderFallo(res, id)
    responderReserva(res, 200, reserva)
  },

  // DELETE /api/reservas/:id  (header If-Match) -> 200 + ETag nuevo | 412 version vieja
  // no se borra la fila: queda con estado 'cancelada' y libera el horario
  async cancel(req, res){
    const id = idValido(req.params.id)
    const version = versionDeIfMatch(req)

    const reserva = await ReservaModel.cancel(id, version)
    if (!reserva) return responderFallo(res, id)
    responderReserva(res, 200, reserva)
  },
}

export default ReservasController
