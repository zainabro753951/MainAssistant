import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import ThemeReloader from '../common/Components/ThemeReloader'

const ProtectUserRoute = ({ children }) => {
  const location = useLocation()
  const { isAuthenticated } = useSelector(state => state.auth)

  if (!isAuthenticated) {
    return <Navigate to={'/login'} state={{ from: location }} replace />
  }

  return children
}

export default ProtectUserRoute
