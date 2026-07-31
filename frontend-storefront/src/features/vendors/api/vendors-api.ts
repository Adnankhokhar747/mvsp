import { apiClient } from '../../../shared/lib/api-client'
import type { Vendor, VendorReview } from '../types'

export async function fetchVendor(slug: string): Promise<Vendor> {
  const { data } = await apiClient.get<{ data: Vendor }>(`/vendors/${slug}`)
  return data.data
}

export async function fetchVendorReviews(vendorId: number): Promise<VendorReview[]> {
  const { data } = await apiClient.get<{ data: VendorReview[] }>(`/vendors/${vendorId}/reviews`)
  return data.data
}
