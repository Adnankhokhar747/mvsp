import { apiClient } from '../../../shared/lib/api-client'
import type { PaginatedResponse, Service, ServiceStatus } from '../types'

export interface ServiceListParams {
  page?: number
  status?: ServiceStatus | 'all'
  search?: string
}

export async function fetchServices(params: ServiceListParams): Promise<PaginatedResponse<Service>> {
  const { data } = await apiClient.get<PaginatedResponse<Service>>('/admin/services', {
    params: {
      page: params.page,
      ...(params.status && params.status !== 'all' ? { 'filter[status]': params.status } : {}),
      ...(params.search ? { 'filter[search]': params.search } : {}),
    },
  })
  return data
}

export type ModerateAction = 'approve' | 'reject' | 'feature'

export async function moderateService(
  serviceId: number,
  action: ModerateAction,
  featuredDays?: number,
): Promise<Service> {
  const { data } = await apiClient.post<{ data: Service }>(`/admin/services/${serviceId}/moderate`, {
    action,
    ...(featuredDays ? { featured_days: featuredDays } : {}),
  })
  return data.data
}
