import { Router } from 'express'
import {
  auth,
  login,
  LoginValidation,
  logout,
  profileSettingValidation,
  registration,
  RegValidation,
  settingAIAssistant,
  updateUserProfileInfo,
} from '../Controllers/Registration.controller.js'
import { secureRoute } from '../middlewares/SecureRoutes.js'
import userImageParser from '../middlewares/userProfileStore.js'
const router = Router()

router.post('/register', RegValidation, registration)

router.post('/login', LoginValidation, login)

router.post('/logout', secureRoute, logout)

router.post(
  '/user/update-profile',
  secureRoute,
  userImageParser.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 },
  ]),
  profileSettingValidation,
  updateUserProfileInfo
)

router.post('/ai-setting', secureRoute, settingAIAssistant)

router.get('/auth', secureRoute, auth)

export default router
