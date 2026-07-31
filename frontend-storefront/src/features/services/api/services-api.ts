import { apiClient } from '../../../shared/lib/api-client'
import type { PaginatedResponse, Service } from '../types'

export interface ServiceListParams {
  page?: number
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  vendorId?: number
  sort?: 'price' | '-price' | 'rating' | '-rating' | 'newest'
}

export async function fetchServices(params: ServiceListParams): Promise<PaginatedResponse<Service>> {
  const sortMap: Record<string, string> = {
    price: 'base_price',
    '-price': '-base_price',
    rating: 'avg_rating',
    '-rating': '-avg_rating',
    newest: '-created_at',
  }

  const { data } = await apiClient.get<PaginatedResponse<Service>>('/services', {
    params: {
      page: params.page,
      ...(params.category ? { 'filter[category]': params.category } : {}),
      ...(params.search ? { 'filter[search]': params.search } : {}),
      ...(params.vendorId ? { 'filter[vendor_id]': params.vendorId } : {}),
      ...(params.minPrice ? { 'filter[min_price]': params.minPrice } : {}),
      ...(params.maxPrice ? { 'filter[max_price]': params.maxPrice } : {}),
      sort: params.sort ? sortMap[params.sort] : undefined,
    },
  })
  return data
}

export async function fetchService(id: number): Promise<Service> {
  const { data } = await apiClient.get<{ data: Service }>(`/services/${id}`)
  return data.data
}
