import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'

export function useApiQuery<T>(
  key: string[],
  fetcher: () => Promise<AxiosResponse<T>>,
  options?: { enabled?: boolean }
) {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await fetcher()
      return data
    },
    enabled: options?.enabled,
  })
}

export function useApiMutation<TData, TResponse>(
  mutator: (data: TData) => Promise<AxiosResponse<TResponse>>,
  options?: {
    onSuccess?: (data: TResponse) => void
    invalidate?: string[][]
  }
) {
  const queryClient = useQueryClient()

  return useMutation<TResponse, Error, TData>({
    mutationFn: async (data: TData) => {
      const { data: response } = await mutator(data)
      return response
    },
    onSuccess: (data) => {
      options?.invalidate?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
      options?.onSuccess?.(data)
    },
  })
}
