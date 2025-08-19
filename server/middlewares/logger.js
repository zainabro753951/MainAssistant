// middleware/logger.js
import morgan from 'morgan'
import { createStream } from 'rotating-file-stream'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

// __dirname workaround in ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Logs directory
const logDirectory = path.join(__dirname, '..', 'logs')
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory)
}

// Create a rotating write stream
const accessLogStream = createStream('access.log', {
  interval: '1d',
  path: logDirectory,
  compress: 'gzip',
})

// Define custom format
const format = ':method :url :status :res[content-length] - :response-time ms'

// Logger middleware based on environment
const loggerMiddleware = (env = process.env.NODE_ENV || 'development') => {
  if (env === 'production') {
    return morgan(format, { stream: accessLogStream })
  } else {
    return morgan('dev')
  }
}

export default loggerMiddleware
