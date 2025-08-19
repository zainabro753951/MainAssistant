import React from 'react'
import axios from 'axios'
import { useMutation } from '@tanstack/react-query'

const useLogout = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const logOutFunc = async () => {
    const response = await axios.post(`${backendUrl}/logout`, null, {
      withCredentials: true,
    })
    return response.data
  }

  // Creating mutation for log out
  return useMutation({
    mutationFn: logOutFunc,
  })
}

export default useLogout
