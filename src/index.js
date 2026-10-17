import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import routes from './routes/index.js'
import { notFound, errorHandler } from './middlewares/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api', routes)

app.get('/', (req, res) => {
  res.json({ message: 'API corriendo' })
})

app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`)
})
