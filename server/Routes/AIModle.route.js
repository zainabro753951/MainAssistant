import { Router } from 'express'
import { textGen } from '../Controllers/AIModel.controller.js'
import { secureRoute } from '../middlewares/SecureRoutes.js'
const router = Router()

// Text to Text Gen
router.post('/user/text-to-text-gen', secureRoute, textGen)

export default router
