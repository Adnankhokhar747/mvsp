import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
  fetchKycDocumentTypes,
  fetchKycDocuments,
  fetchMyVendor,
  fetchStaff,
  inviteStaff,
  removeStaff,
  updateVendor,
  uploadKycDocument,
  type VendorProfilePayload,
} from '../api/vendor-api'
import type { VendorRole } from '../types'

const MY_VENDOR_KEY = ['vendor', 'me'] as const

export function useMyVendor() {
  return useQuery({
    queryKey: MY_VENDOR_KEY,
    queryFn: fetchMyVendor,
    retry: false,
    throwOnError: (error) => !(axios.isAxiosError(error) && error.response?.status === 404),
  })
}

export function useUpdateVendor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: VendorProfilePayload }) => updateVendor(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MY_VENDOR_KEY }),
  })
}

export function useKycDocumentTypes() {
  return useQuery({
    queryKey: ['kyc-document-types'],
    queryFn: fetchKycDocumentTypes,
    staleTime: 5 * 60 * 1000,
  })
}

export function useKycDocuments(vendorId: number | undefined) {
  return useQuery({
    queryKey: ['kyc-documents', vendorId],
    queryFn: () => fetchKycDocuments(vendorId as number),
    enabled: vendorId !== undefined,
  })
}

export function useUploadKycDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ vendorId, kycDocumentTypeId, file }: { vendorId: number; kycDocumentTypeId: number; file: File }) =>
      uploadKycDocument(vendorId, kycDocumentTypeId, file),
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['kyc-documents', variables.vendorId] }),
  })
}

export function useStaff(vendorId: number | undefined) {
  return useQuery({
    queryKey: ['staff', vendorId],
    queryFn: () => fetchStaff(vendorId as number),
    enabled: vendorId !== undefined,
  })
}

export function useInviteStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ vendorId, email, role }: { vendorId: number; email: string; role: Exclude<VendorRole, 'owner'> }) =>
      inviteStaff(vendorId, email, role),
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['staff', variables.vendorId] }),
  })
}

export function useRemoveStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ vendorId, userId }: { vendorId: number; userId: number }) => removeStaff(vendorId, userId),
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['staff', variables.vendorId] }),
  })
}
