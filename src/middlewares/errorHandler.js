// MANEJO DE ERRORES: convierte cualquier error en una respuesta { success: false, message }
// error con codigo HTTP: throw new HttpError(404, 'Espacio no encontrado')
export class HttpError extends Error {
  constructor(status, message){
    super(message)
    this.status = status
  }
}

// errores de PostgreSQL que son culpa de los datos enviados, no del servidor
const erroresPostgres = {
  // regla EXCLUDE reservas_sin_cruce: dos reservas se cruzan
  '23P01': { status: 409, message: 'El espacio ya esta reservado en ese horario' },
  // llave foranea espacio_id: el espacio no existe
  '23503': { status: 404, message: 'El espacio no existe' },
  // regla CHECK reservas_horario_valido
  '23514': { status: 400, message: 'Datos invalidos: la hora de fin debe ser despues del inicio' },
}

// rutas que no existen
export function notFound(req, res){
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` })
}

// ultimo middleware: todos los errores responden { success: false, message }
// Express 5 manda aqui tambien los errores de las funciones async
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next){
  // express.json() no pudo leer el cuerpo
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'El cuerpo de la peticion no es un JSON valido' })
  }

  if (err.status) {
    return res.status(err.status).json({ success: false, message: err.message })
  }

  const errorConocido = erroresPostgres[err.code]
  if (errorConocido) {
    return res.status(errorConocido.status).json({ success: false, message: errorConocido.message })
  }

  console.error(err)
  res.status(500).json({ success: false, message: 'Error interno del servidor' })
}
