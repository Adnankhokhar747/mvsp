import { apiClient } from '../../../shared/lib/api-client'
import type { PaymentGateway } from '../types'

export async function fetchPaymentGateways(): Promise<PaymentGateway[]> {
  const { data } = await apiClient.get<{ data: PaymentGateway[] }>('/admin/payment-gateways')
  return data.data
}

export interface UpdatePaymentGatewayPayload {
  is_active?: boolean
  is_default?: boolean
  config?: Record<string, unknown>
}

export async function updatePaymentGateway(id: number, payload: UpdatePaymentGatewayPayload): Promise<PaymentGateway> {
  const { data } = await apiClient.patch<{ data: PaymentGateway }>(`/admin/payment-gateways/${id}`, payload)
  return data.data
}
