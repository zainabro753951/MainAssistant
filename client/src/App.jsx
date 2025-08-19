import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AllRoutes } from './Routes/AllRoutes.route'
import Home from './pages/Home/HomeDashboard.jsx'
import ProtectUserRoute from './Secure/ProtectUserRoute.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import { useSelector } from 'react-redux'

const App = () => {
  const { isAuthenticated } = useSelector(state => state.auth)
  return (
    <Routes>
      {AllRoutes.map((route, idx) => {
        return (
          <Route
            key={idx}
            path={route.path}
            element={<ProtectUserRoute>{route.element}</ProtectUserRoute>}
          />
        )
      })}
      <Route path="/login" element={isAuthenticated ? <Navigate to={'/'} /> : <Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default App
