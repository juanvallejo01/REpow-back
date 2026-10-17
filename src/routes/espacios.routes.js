import { Router } from 'express'
import EspaciosController from '../controllers/espacios.controller.js'

const router = Router()

router.get('/', EspaciosController.getAll)                   // GET /api/espacios
router.get('/:id', EspaciosController.getById)               // GET /api/espacios/:id
router.get('/:id/reservas', EspaciosController.getDisponibilidad) // GET /api/espacios/:id/reservas?fecha=

export default router
