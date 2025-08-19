import { useQuery } from '@tanstack/react-query'

export const getQuery = (queryKey, queryFn) => {
  const { data, isError, isSuccess, isLoading, error } = useQuery({
    queryKey: [queryKey],
    queryFn,
  })

  return { data: data, isError, isSuccess, isLoading, error }
}
