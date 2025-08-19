import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
const app = express()
const server = http.createServer(app)

const allowedOrigins = [...process.env.FRONTEND_URLS.split(','), 'http://localhost:5173']

const ioOptions = {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    exposedHeaders: ['x-custom-header'],
  },
}

const io = new Server(server, ioOptions)

io.on('connection', socket => {
  console.log('user connected!')
  socket.on('user-join', userId => {
    socket.join(userId)
    console.log(userId)
  })
  socket.on('disconnected', () => {
    console.log('user disconnected')
  })
})

export { server, io, app, express }
