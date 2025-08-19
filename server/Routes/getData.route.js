import { Router } from 'express'
import { secureRoute } from '../middlewares/SecureRoutes.js'
import { getUser } from '../Controllers/getUserData.controller.js'
const router = Router()

// Get User Data
router.get('/user/get', secureRoute, getUser)

export default router
