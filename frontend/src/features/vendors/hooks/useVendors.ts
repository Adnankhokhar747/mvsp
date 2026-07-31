import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { approveVendor, fetchVendors, rejectVendor, suspendVendor, type VendorListParams } from '../api/vendors-api'

const VENDORS_KEY = ['admin', 'vendors'] as const

export function useVendors(params: VendorListParams) {
  return useQuery({
    queryKey: [...VENDORS_KEY, params],
    queryFn: () => fetchVendors(params),
    placeholderData: keepPreviousData,
  })
}

export function useApproveVendor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vendorId: number) => approveVendor(vendorId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: VENDORS_KEY }),
  })
}

export function useRejectVendor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ vendorId, reason }: { vendorId: number; reason: string }) => rejectVendor(vendorId, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: VENDORS_KEY }),
  })
}

export function useSuspendVendor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ vendorId, reason }: { vendorId: number; reason?: string }) => suspendVendor(vendorId, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: VENDORS_KEY }),
  })
}
