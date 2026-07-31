import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchService, fetchServices, type ServiceListParams } from '../api/services-api'

export function useServices(params: ServiceListParams) {
  return useQuery({
    queryKey: ['services', params],
    queryFn: () => fetchServices(params),
    placeholderData: keepPreviousData,
  })
}

export function useService(id: number | undefined) {
  return useQuery({
    queryKey: ['services', 'detail', id],
    queryFn: () => fetchService(id as number),
    enabled: id !== undefined,
  })
}
