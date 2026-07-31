import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  confirmTransaction,
  fetchTransaction,
  fetchTransactions,
  refundTransaction,
  type TransactionListParams,
} from '../api/payments-api'

const TRANSACTIONS_KEY = ['transactions'] as const

export function useTransactions(params: TransactionListParams) {
  return useQuery({
    queryKey: [...TRANSACTIONS_KEY, params],
    queryFn: () => fetchTransactions(params),
    placeholderData: keepPreviousData,
  })
}

export function useTransaction(id: number | null) {
  return useQuery({
    queryKey: [...TRANSACTIONS_KEY, 'detail', id],
    queryFn: () => fetchTransaction(id as number),
    enabled: id !== null,
  })
}

export function useConfirmTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => confirmTransaction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
  })
}

export function useRefundTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, amount, reason }: { id: number; amount: number; reason?: string }) =>
      refundTransaction(id, amount, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
  })
}
