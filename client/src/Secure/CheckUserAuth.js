import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
const fetchUserAuth = async () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  try {
    const response = await axios.get(`${backendUrl}/auth`, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    throw new Error(error.message)
  }
}

const useCheckUserAuth = () => {
  return useQuery({
    queryKey: ['userAuth'],
    queryFn: fetchUserAuth,
    staleTime: 5 * 60 * 1000, // 5 minutes: data stays fresh
    cacheTime: 10 * 60 * 1000, // 10 minutes: keep in cache
    refetchOnWindowFocus: false, // Don't auto-refetch on tab focus
    retry: 0, // Retry once on failure
    refetchOnMount: false, // Avoid refetching if cached
    refetchIntervalInBackground: false,
  })
}

export default useCheckUserAuth
