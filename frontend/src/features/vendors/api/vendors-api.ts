import { apiClient } from '../../../shared/lib/api-client'
import type { PaginatedResponse, Vendor, VendorStatus } from '../types'

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
