import { Router } from 'express'
import {
  addRepo,
  createRepo,
  deleteRepo,
  fetchFileContent,
  fetchRepos,
  getAllRepos,
} from '../Controllers/RepoSystem.controller.js'
import { secureRoute } from '../middlewares/SecureRoutes.js'
import multer from 'multer'
const router = Router()

// storage config (files memory me ya disk pe save karne ke liye)
const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post('/repos', secureRoute, createRepo)
router.get('/get/repos', secureRoute, getAllRepos)
router.post('/repos/:repoId/push', secureRoute, upload.array('files'), addRepo)

router.get('/repos/fetch/*prefix', secureRoute, fetchRepos)
router.get('/repos/file-content/*prefix', secureRoute, fetchFileContent)
router.delete('/repos/delete/:repoId/:repoName', secureRoute, deleteRepo)
export default router
