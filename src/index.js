// PUNTO DE ENTRADA DEL BACK: arma Express y enciende el servidor
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import routes from './routes/index.js'
import { notFound, errorHandler } from './middlewares/errorHandler.js'

// 1. crear la aplicacion
const app = express()
const PORT = process.env.PORT || 3000

// 2. configuracion general
// el ETag lo pone el controlador de reservas con la version; se apaga el automatico de Express
app.set('etag', false)

// exposedHeaders: sin esto el navegador no deja que el front lea el ETag
app.use(cors({ exposedHeaders: ['ETag'] }))
app.use(express.json())

// 3. todas las rutas de la API empiezan por /api (ver routes/index.js)
app.use('/api', routes)

app.get('/', (req, res) => {
  res.json({ message: 'API corriendo' })
})

// 4. manejo de errores: siempre va despues de las rutas
app.use(notFound)
app.use(errorHandler)

// 5. encender el servidor
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`)
})
