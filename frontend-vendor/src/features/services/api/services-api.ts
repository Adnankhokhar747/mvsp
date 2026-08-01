import { apiClient } from '../../../shared/lib/api-client'
import type { PaginatedResponse, Service, ServiceAvailabilitySlot, ServiceMedia, ServicePackage, ServiceStatus } from '../types'

export interface ServiceListParams {
  page?: number
  status?: ServiceStatus | 'all'
}

export async function fetchVendorServices(params: ServiceListParams): Promise<PaginatedResponse<Service>> {
  const { data } = await apiClient.get<PaginatedResponse<Service>>('/vendor/services', {
    params: {
      page: params.page,
      ...(params.status && params.status !== 'all' ? { 'filter[status]': params.status } : {}),
    },
  })
  return data
}

export async function fetchVendorService(id: number): Promise<Service> {
  const { data } = await apiClient.get<{ data: Service }>(`/vendor/services/${id}`)
  return data.data
}

export interface ServicePayload {
  category_id: number
  title: string
  short_description?: string
  description?: string
  base_price?: number
  price_type: 'fixed' | 'hourly' | 'quote'
  duration_minutes?: number
  attributes?: Record<string, unknown>
  status?: 'draft' | 'paused'
}

export async function createService(payload: ServicePayload): Promise<Service> {
  const { data } = await apiClient.post<{ data: Service }>('/vendor/services', payload)
  return data.data
}

export async function updateService(id: number, payload: Partial<ServicePayload>): Promise<Service> {
  const { data } = await apiClient.patch<{ data: Service }>(`/vendor/services/${id}`, payload)
  return data.data
}

export async function uploadServiceMedia(id: number, file: File): Promise<ServiceMedia> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await apiClient.post<{ data: ServiceMedia }>(`/vendor/services/${id}/media`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export interface ServicePackagePayload {
  name: string
  price: number
  duration_minutes?: number
  description?: string
  sort_order?: number
}

export async function createPackage(serviceId: number, payload: ServicePackagePayload): Promise<ServicePackage> {
  const { data } = await apiClient.post<{ data: ServicePackage }>(`/vendor/services/${serviceId}/packages`, payload)
  return data.data
}

export async function updatePackage(
  serviceId: number,
  packageId: number,
  payload: Partial<ServicePackagePayload>,
): Promise<ServicePackage> {
  const { data } = await apiClient.patch<{ data: ServicePackage }>(
    `/vendor/services/${serviceId}/packages/${packageId}`,
    payload,
  )
  return data.data
}

export async function deletePackage(serviceId: number, packageId: number): Promise<void> {
  await apiClient.delete(`/vendor/services/${serviceId}/packages/${packageId}`)
}

export async function setAvailability(
  id: number,
  slots: ServiceAvailabilitySlot[],
): Promise<ServiceAvailabilitySlot[]> {
  const { data } = await apiClient.patch<{ data: ServiceAvailabilitySlot[] }>(`/vendor/services/${id}/availability`, {
    slots,
  })
  return data.data
}
