import { Router } from 'express'
import espaciosRoutes from './espacios.routes.js'
import reservasRoutes from './reservas.routes.js'

// todas las rutas cuelgan de /api (ver index.js)
const router = Router()

router.use('/espacios', espaciosRoutes)
router.use('/reservas', reservasRoutes)

export default router
