import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { approvePayout, fetchPayouts, rejectPayout, type PayoutListParams } from '../api/payouts-api'

const PAYOUTS_KEY = ['payouts'] as const

export function usePayouts(params: PayoutListParams) {
  return useQuery({
    queryKey: [...PAYOUTS_KEY, params],
    queryFn: () => fetchPayouts(params),
    placeholderData: keepPreviousData,
  })
}

export function useApprovePayout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => approvePayout(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PAYOUTS_KEY }),
  })
}

export function useRejectPayout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => rejectPayout(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PAYOUTS_KEY }),
  })
}
