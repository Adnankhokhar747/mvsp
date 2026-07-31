import { apiClient } from '../../../shared/lib/api-client'
import type { KycDocument, KycDocumentType, MyVendor, StaffMember, Vendor, VendorRole } from '../types'

export async function fetchMyVendor(): Promise<MyVendor> {
  const { data } = await apiClient.get<{ data: MyVendor }>('/vendor/me')
  return data.data
}

export interface VendorProfilePayload {
  business_name?: string
  description?: string
  email?: string
  phone?: string
  whatsapp?: string
  currency_code?: string
  timezone?: string
}

export async function updateVendor(id: number, payload: VendorProfilePayload): Promise<Vendor> {
  const { data } = await apiClient.patch<{ data: Vendor }>(`/vendors/${id}`, payload)
  return data.data
}

export async function fetchKycDocumentTypes(): Promise<KycDocumentType[]> {
  const { data } = await apiClient.get<{ data: KycDocumentType[] }>('/vendor/kyc-document-types')
  return data.data
}

export async function fetchKycDocuments(vendorId: number): Promise<KycDocument[]> {
  const { data } = await apiClient.get<{ data: KycDocument[] }>(`/vendors/${vendorId}/kyc-documents`)
  return data.data
}

export async function uploadKycDocument(
  vendorId: number,
  kycDocumentTypeId: number,
  file: File,
): Promise<KycDocument> {
  const formData = new FormData()
  formData.append('kyc_document_type_id', String(kycDocumentTypeId))
  formData.append('file', file)
  const { data } = await apiClient.post<{ data: KycDocument }>(`/vendors/${vendorId}/kyc-documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function fetchStaff(vendorId: number): Promise<StaffMember[]> {
  const { data } = await apiClient.get<{ data: StaffMember[] }>(`/vendors/${vendorId}/staff`)
  return data.data
}

export async function inviteStaff(
  vendorId: number,
  email: string,
  role: Exclude<VendorRole, 'owner'>,
): Promise<StaffMember> {
  const { data } = await apiClient.post<{ data: StaffMember }>(`/vendors/${vendorId}/staff/invite`, { email, role })
  return data.data
}

export async function removeStaff(vendorId: number, userId: number): Promise<void> {
  await apiClient.delete(`/vendors/${vendorId}/staff/${userId}`)
}
