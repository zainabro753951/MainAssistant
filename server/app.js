import { server, app, express } from './server.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import loggerMiddleware from './middlewares/logger.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
dotenv.config()

// Routes
import registrationRoutes from './Routes/Registration.route.js'
import AiModles from './Routes/AIModle.route.js'
import RepoSystem from './Routes/RepoSystem.route.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Port
const port = process.env.PORT || 3500
const isProduction = process.env.NODE_ENV === 'production'

// CORS configuration
const corsOptions = {
  origin: isProduction
    ? process.env.FRONTEND_URLS?.split(',') || []
    : ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-custom-header'],
  credentials: true,
  exposedHeaders: ['x-custom-header'],
  optionsSuccessStatus: 204,
  maxAge: 86400, // 24 hours
}
app.use(cors(corsOptions))

// Middleware
app.use(loggerMiddleware())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Routes
app.use(registrationRoutes)
app.use(AiModles)
app.use(RepoSystem)

server.listen(port, () => console.log(`Your Server running on this port ${port}`))
