import { HttpError } from '../middlewares/errorHandler.js'

// validaciones que comparten los controladores

export function idValido(valor, nombre = 'id'){
  const id = Number(valor)
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, `El ${nombre} debe ser un numero entero positivo`)
  return id
}

export function fechaValida(valor){
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor ?? '') || Number.isNaN(Date.parse(valor))) {
    throw new HttpError(400, 'La fecha debe tener el formato YYYY-MM-DD')
  }
  return valor
}

// fecha y hora con zona horaria, ej: 2026-10-20T08:00:00-05:00
export function fechaHoraValida(valor, nombre){
  if (typeof valor !== 'string' || Number.isNaN(Date.parse(valor))) {
    throw new HttpError(400, `${nombre} debe ser una fecha y hora valida (ej: 2026-10-20T08:00:00-05:00)`)
  }
  return valor
}

// If-Match: "3" -> 3  (la version que tenia el cliente cuando abrio la reserva)
export function versionDeIfMatch(req){
  const valor = req.get('If-Match')
  if (!valor) throw new HttpError(428, 'Falta el header If-Match con la version de la reserva')

  const version = Number(valor.replaceAll('"', ''))
  if (!Number.isInteger(version) || version <= 0) {
    throw new HttpError(400, 'If-Match debe tener la version de la reserva, ej: "3"')
  }
  return version
}
