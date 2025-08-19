import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useSocketContext } from './SocketProvder'

const useJoinSocketRoom = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth)
  const { socket } = useSocketContext()

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }
    if (user?.id && socket.connected) {
      socket.emit('user-join', user.id)
    }

    // Optional: on reconnect, re-emit join
    socket.on('connect', () => {
      if (user?.id) {
        socket.emit('user-join', user.id)
      }
    })

    return () => {
      socket.off('connect') // cleanup
    }
  }, [user?.id])
}

export default useJoinSocketRoom
