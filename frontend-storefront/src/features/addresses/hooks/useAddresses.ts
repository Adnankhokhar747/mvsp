import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAddress, deleteAddress, fetchAddresses, updateAddress, type AddressPayload } from '../api/addresses-api'

const ADDRESSES_KEY = ['addresses'] as const

export function useAddresses() {
  return useQuery({ queryKey: ADDRESSES_KEY, queryFn: fetchAddresses })
}

export function useCreateAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AddressPayload) => createAddress(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  })
}

export function useUpdateAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<AddressPayload> }) => updateAddress(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  })
}

export function useDeleteAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  })
}
