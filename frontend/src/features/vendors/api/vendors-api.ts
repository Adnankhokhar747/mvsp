import { apiClient } from '../../../shared/lib/api-client'
import type { KycDocumentStatus, PaginatedResponse, Vendor, VendorKycDocument, VendorStatus } from '../types'

export interface VendorListParams {
  page?: number
  status?: VendorStatus | 'all'
  search?: string
}

export async function fetchVendors(params: VendorListParams): Promise<PaginatedResponse<Vendor>> {
  const { data } = await apiClient.get<PaginatedResponse<Vendor>>('/admin/vendors', {
    params: {
      page: params.page,
      ...(params.status && params.status !== 'all' ? { 'filter[status]': params.status } : {}),
      ...(params.search ? { 'filter[business_name]': params.search } : {}),
    },
  })
  return data
}

export async function approveVendor(vendorId: number): Promise<Vendor> {
  const { data } = await apiClient.post<{ data: Vendor }>(`/admin/vendors/${vendorId}/approve`)
  return data.data
}

export async function rejectVendor(vendorId: number, reason: string): Promise<Vendor> {
  const { data } = await apiClient.post<{ data: Vendor }>(`/admin/vendors/${vendorId}/reject`, { reason })
  return data.data
}

export async function suspendVendor(vendorId: number, reason?: string): Promise<Vendor> {
  const { data } = await apiClient.post<{ data: Vendor }>(`/admin/vendors/${vendorId}/suspend`, { reason })
  return data.data
}

export async function fetchVendorKycDocuments(vendorId: number): Promise<VendorKycDocument[]> {
  const { data } = await apiClient.get<{ data: VendorKycDocument[] }>(`/admin/vendors/${vendorId}/kyc-documents`)
  return data.data
}

export async function reviewKycDocument(
  vendorId: number,
  documentId: number,
  status: KycDocumentStatus,
  reason?: string,
): Promise<VendorKycDocument> {
  const { data } = await apiClient.post<{ data: VendorKycDocument }>(
    `/admin/vendors/${vendorId}/kyc-documents/${documentId}/review`,
    { status, reason },
  )
  return data.data
}

export async function openKycDocument(vendorId: number, documentId: number): Promise<void> {
  // A plain <a href> to this endpoint is unreliable: Sanctum's stateful-request
  // detection relies on Origin/Referer headers that a top-level link navigation
  // doesn't send the same way an XHR does, so the request can fall through to
  // guest and 500 on Laravel's default (non-existent, API-only app) login
  // redirect. Fetching through the already-authenticated apiClient sidesteps
  // that entirely - it's the same request path every other admin call uses.
  //
  // A new-tab preview (window.open + navigate to a blob: URL) doesn't work
  // here either: Chromium refuses to navigate a *different* window/tab to a
  // blob: URL created in the opener's context (an anti-phishing restriction),
  // so the popup would just sit on about:blank forever. Triggering a real
  // download in the current window sidesteps cross-window blob navigation
  // entirely.
  const response = await apiClient.get(`/admin/vendors/${vendorId}/kyc-documents/${documentId}/download`, {
    responseType: 'blob',
  })
  const disposition = response.headers['content-disposition'] as string | undefined
  const filename = disposition?.match(/filename=([^;]+)/)?.[1]?.trim() ?? `kyc-document-${documentId}`

  const blobUrl = URL.createObjectURL(response.data as Blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
}
