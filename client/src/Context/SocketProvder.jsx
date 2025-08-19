import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

// Replace these with actual imports or environment variables
const backendUrl = import.meta.env.VITE_BACKEND_URL
const maxReconnectAttempts = 5 // Or from config/auth logic

const SocketContext = createContext(null)

export const useSocketContext = () => useContext(SocketContext)

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const newSocket = io(backendUrl, {
      withCredentials: true,
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 20000,
      path: '/socket.io/',
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
}

export default SocketProvider
