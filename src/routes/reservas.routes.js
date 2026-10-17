import { Router } from 'express'
import ReservasController from '../controllers/reservas.controller.js'

const router = Router()

router.get('/', ReservasController.getAll)      // GET  /api/reservas
router.get('/:id', ReservasController.getById)  // GET  /api/reservas/:id
router.post('/', ReservasController.create)     // POST /api/reservas

export default router
