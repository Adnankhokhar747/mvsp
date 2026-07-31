import { apiClient } from '../../../shared/lib/api-client'
import type { PayoutRequest, PayoutStatus, PaginatedResponse } from '../types'

export interface PayoutListParams {
  page?: number
  status?: PayoutStatus | 'all'
}

export async function fetchPayouts(params: PayoutListParams): Promise<PaginatedResponse<PayoutRequest>> {
  const { data } = await apiClient.get<PaginatedResponse<PayoutRequest>>('/admin/payouts', {
    params: {
      page: params.page,
      ...(params.status && params.status !== 'all' ? { 'filter[status]': params.status } : {}),
    },
  })
  return data
}

export async function approvePayout(id: number): Promise<PayoutRequest> {
  const { data } = await apiClient.post<{ data: PayoutRequest }>(`/admin/payouts/${id}/approve`)
  return data.data
}

export async function rejectPayout(id: number, reason: string): Promise<PayoutRequest> {
  const { data } = await apiClient.post<{ data: PayoutRequest }>(`/admin/payouts/${id}/reject`, { reason })
  return data.data
}
