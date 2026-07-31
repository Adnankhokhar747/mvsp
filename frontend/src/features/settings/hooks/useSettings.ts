import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchPaymentGateways, updatePaymentGateway, type UpdatePaymentGatewayPayload } from '../api/settings-api'

const GATEWAYS_KEY = ['payment-gateways'] as const

export function usePaymentGateways() {
  return useQuery({
    queryKey: GATEWAYS_KEY,
    queryFn: fetchPaymentGateways,
  })
}

export function useUpdatePaymentGateway() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePaymentGatewayPayload }) =>
      updatePaymentGateway(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GATEWAYS_KEY }),
  })
}
