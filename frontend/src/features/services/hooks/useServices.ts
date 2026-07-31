import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchServices, moderateService, type ModerateAction, type ServiceListParams } from '../api/services-api'

const SERVICES_KEY = ['admin', 'services'] as const

export function useServices(params: ServiceListParams) {
  return useQuery({
    queryKey: [...SERVICES_KEY, params],
    queryFn: () => fetchServices(params),
    placeholderData: keepPreviousData,
  })
}

export function useModerateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      serviceId,
      action,
      featuredDays,
    }: {
      serviceId: number
      action: ModerateAction
      featuredDays?: number
    }) => moderateService(serviceId, action, featuredDays),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SERVICES_KEY }),
  })
}
