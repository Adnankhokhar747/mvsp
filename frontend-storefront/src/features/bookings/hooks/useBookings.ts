import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  acceptQuote,
  cancelBooking,
  createBooking,
  createReview,
  fetchAvailability,
  fetchBooking,
  fetchBookings,
  rejectQuote,
  type BookingListParams,
  type CreateBookingPayload,
  type CreateReviewPayload,
} from '../api/bookings-api'

const BOOKINGS_KEY = ['bookings'] as const

export function useBookings(params: BookingListParams) {
  return useQuery({
    queryKey: [...BOOKINGS_KEY, params],
    queryFn: () => fetchBookings(params),
    placeholderData: keepPreviousData,
  })
}

export function useBooking(id: number | undefined) {
  return useQuery({
    queryKey: [...BOOKINGS_KEY, 'detail', id],
    queryFn: () => fetchBooking(id as number),
    enabled: id !== undefined,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY }),
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => cancelBooking(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY }),
  })
}

export function useAcceptQuote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookingId: number) => acceptQuote(bookingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY }),
  })
}

export function useRejectQuote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookingId: number) => rejectQuote(bookingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY }),
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, payload }: { bookingId: number; payload: CreateReviewPayload }) =>
      createReview(bookingId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY }),
  })
}

export function useAvailability(serviceId: number | undefined, dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ['availability', serviceId, dateFrom, dateTo],
    queryFn: () => fetchAvailability(serviceId as number, dateFrom, dateTo),
    enabled: serviceId !== undefined,
  })
}
