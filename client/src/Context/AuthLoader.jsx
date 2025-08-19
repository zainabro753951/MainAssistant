import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { login, logout } from '../features/auth'
import useCheckUserAuth from '../Secure/CheckUserAuth'
import { PropagateLoader } from 'react-spinners'
import ThemeReloader from '../common/Components/ThemeReloader'
import useJoinSocketRoom from './UseJoinSocket'

const AuthLoader = ({ children }) => {
  const dispatch = useDispatch()
  const { data, isSuccess, isError, error, isLoading } = useCheckUserAuth()
  useJoinSocketRoom()

  useEffect(() => {
    if (isSuccess && data?.user) {
      dispatch(login({ user: data.user }))
    }

    if (isError) {
      console.error('Auth check failed:', error)
      dispatch(logout())
    }
  }, [isSuccess, isError, data, error, dispatch])

  if (isLoading) {
    return <ThemeReloader />
  }

  return children // Render app only after auth is checked
}

export default AuthLoader
