import { apiClient } from '../../../shared/lib/api-client'
import type { AvailabilitySlot, Booking, BookingStatus, PaginatedResponse, Review } from '../types'

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

export interface CreateBookingPayload {
  service_id: number
  service_package_id?: number
  scheduled_at?: string
  notes?: string
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  const { data } = await apiClient.post<{ data: Booking }>('/bookings', payload)
  return data.data
}

export async function cancelBooking(id: number, reason?: string): Promise<Booking> {
  const { data } = await apiClient.post<{ data: Booking }>(`/bookings/${id}/cancel`, { reason })
  return data.data
}

export async function acceptQuote(bookingId: number): Promise<Booking> {
  const { data } = await apiClient.post<{ data: Booking }>(`/bookings/${bookingId}/quote/accept`)
  return data.data
}

export async function rejectQuote(bookingId: number): Promise<Booking> {
  const { data } = await apiClient.post<{ data: Booking }>(`/bookings/${bookingId}/quote/reject`)
  return data.data
}

export interface CreateReviewPayload {
  rating: number
  title?: string
  comment?: string
}

export async function createReview(bookingId: number, payload: CreateReviewPayload): Promise<Review> {
  const { data } = await apiClient.post<{ data: Review }>(`/bookings/${bookingId}/review`, payload)
  return data.data
}

export async function fetchAvailability(
  serviceId: number,
  dateFrom: string,
  dateTo: string,
): Promise<AvailabilitySlot[]> {
  const { data } = await apiClient.get<{ data: AvailabilitySlot[] }>(`/services/${serviceId}/availability`, {
    params: { date_from: dateFrom, date_to: dateTo },
  })
  return data.data
}
