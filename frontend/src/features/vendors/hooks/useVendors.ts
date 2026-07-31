import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approveVendor,
  fetchVendorKycDocuments,
  fetchVendors,
  rejectVendor,
  reviewKycDocument,
  suspendVendor,
  type VendorListParams,
} from '../api/vendors-api'
import type { KycDocumentStatus } from '../types'

const VENDORS_KEY = ['admin', 'vendors'] as const
const KYC_DOCUMENTS_KEY = ['admin', 'vendor-kyc-documents'] as const

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

export function useVendorKycDocuments(vendorId: number | null) {
  return useQuery({
    queryKey: [...KYC_DOCUMENTS_KEY, vendorId],
    queryFn: () => fetchVendorKycDocuments(vendorId as number),
    enabled: vendorId !== null,
  })
}

export function useReviewKycDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      vendorId,
      documentId,
      status,
      reason,
    }: {
      vendorId: number
      documentId: number
      status: KycDocumentStatus
      reason?: string
    }) => reviewKycDocument(vendorId, documentId, status, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KYC_DOCUMENTS_KEY }),
  })
}
