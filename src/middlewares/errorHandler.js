// error con codigo HTTP: throw new HttpError(404, 'Espacio no encontrado')
export class HttpError extends Error {
  constructor(status, message){
    super(message)
    this.status = status
  }
}

// errores de PostgreSQL que son culpa de los datos enviados, no del servidor
const erroresPostgres = {
  '23P01': [409, 'El espacio ya esta reservado en ese horario'],    // EXCLUDE reservas_sin_cruce
  '23503': [404, 'El espacio no existe'],                            // llave foranea espacio_id
  '23514': [400, 'Datos invalidos: la hora de fin debe ser despues del inicio'], // CHECK
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

  if (erroresPostgres[err.code]) {
    const [status, message] = erroresPostgres[err.code]
    return res.status(status).json({ success: false, message })
  }

  console.error(err)
  res.status(500).json({ success: false, message: 'Error interno del servidor' })
}
