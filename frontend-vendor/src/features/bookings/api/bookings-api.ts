import { apiClient } from '../../../shared/lib/api-client'
import type { Booking, BookingQuote, BookingStatus, PaginatedResponse } from '../types'

export interface BookingListParams {
  page?: number
  status?: BookingStatus | 'all'
}

export async function fetchBookings(params: BookingListParams): Promise<PaginatedResponse<Booking>> {
  const { data } = await apiClient.get<PaginatedResponse<Booking>>('/bookings', {
    params: {
      page: params.page,
      ...(params.status && params.status !== 'all' ? { 'filter[status]': params.status } : {}),
    },
  })
  return data
}

export async function fetchBooking(id: number): Promise<Booking> {
  const { data } = await apiClient.get<{ data: Booking }>(`/bookings/${id}`)
  return data.data
}

export interface SubmitQuotePayload {
  quoted_price: number
  quoted_duration?: number
  message?: string
}

export async function submitQuote(bookingId: number, payload: SubmitQuotePayload): Promise<BookingQuote> {
  const { data } = await apiClient.post<{ data: BookingQuote }>(`/vendor/bookings/${bookingId}/quote`, payload)
  return data.data
}

export type BookingStatusAction = 'confirm' | 'start' | 'complete'

export async function updateBookingStatus(bookingId: number, action: BookingStatusAction): Promise<Booking> {
  const { data } = await apiClient.post<{ data: Booking }>(`/vendor/bookings/${bookingId}/status`, { action })
  return data.data
}

export async function cancelBooking(id: number, reason?: string): Promise<Booking> {
  const { data } = await apiClient.post<{ data: Booking }>(`/bookings/${id}/cancel`, { reason })
  return data.data
}
