import { useQuery } from '@tanstack/react-query'
import { fetchVendor, fetchVendorReviews } from '../api/vendors-api'

export function useVendor(slug: string | undefined) {
  return useQuery({
    queryKey: ['vendors', slug],
    queryFn: () => fetchVendor(slug as string),
    enabled: !!slug,
  })
}

export function useVendorReviews(vendorId: number | undefined) {
  return useQuery({
    queryKey: ['vendors', vendorId, 'reviews'],
    queryFn: () => fetchVendorReviews(vendorId as number),
    enabled: vendorId !== undefined,
  })
}
