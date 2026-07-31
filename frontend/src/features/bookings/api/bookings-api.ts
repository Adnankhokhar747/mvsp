import { apiClient } from '../../../shared/lib/api-client'
import type { Booking, BookingStatus, PaginatedResponse } from '../types'

export interface BookingListParams {
  page?: number
  status?: BookingStatus | 'all'
  search?: string
}

export async function fetchBookings(params: BookingListParams): Promise<PaginatedResponse<Booking>> {
  const { data } = await apiClient.get<PaginatedResponse<Booking>>('/bookings', {
    params: {
      page: params.page,
      ...(params.status && params.status !== 'all' ? { 'filter[status]': params.status } : {}),
      ...(params.search ? { 'filter[booking_number]': params.search } : {}),
    },
  })
  return data
}

export async function fetchBooking(id: number): Promise<Booking> {
  const { data } = await apiClient.get<{ data: Booking }>(`/bookings/${id}`)
  return data.data
}

export async function cancelBooking(id: number, reason?: string): Promise<Booking> {
  const { data } = await apiClient.post<{ data: Booking }>(`/bookings/${id}/cancel`, { reason })
  return data.data
}
