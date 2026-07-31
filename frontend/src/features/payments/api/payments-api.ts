import { apiClient } from '../../../shared/lib/api-client'
import type { Transaction, TransactionStatus, PaginatedResponse } from '../types'

export interface TransactionListParams {
  page?: number
  status?: TransactionStatus | 'all'
  search?: string
}

export async function fetchTransactions(params: TransactionListParams): Promise<PaginatedResponse<Transaction>> {
  const { data } = await apiClient.get<PaginatedResponse<Transaction>>('/transactions', {
    params: {
      page: params.page,
      ...(params.status && params.status !== 'all' ? { 'filter[status]': params.status } : {}),
      ...(params.search ? { 'filter[transaction_number]': params.search } : {}),
    },
  })
  return data
}

export async function fetchTransaction(id: number): Promise<Transaction> {
  const { data } = await apiClient.get<{ data: Transaction }>(`/transactions/${id}`)
  return data.data
}

export async function confirmTransaction(id: number): Promise<Transaction> {
  const { data } = await apiClient.post<{ data: Transaction }>(`/transactions/${id}/confirm`)
  return data.data
}

export async function refundTransaction(id: number, amount: number, reason?: string): Promise<Transaction> {
  await apiClient.post(`/transactions/${id}/refund`, { amount, reason })
  return fetchTransaction(id)
}
