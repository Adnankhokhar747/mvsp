import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelBooking,
  fetchBooking,
  fetchBookings,
  submitQuote,
  updateBookingStatus,
  type BookingListParams,
  type BookingStatusAction,
  type SubmitQuotePayload,
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

export function useSubmitQuote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, payload }: { bookingId: number; payload: SubmitQuotePayload }) =>
      submitQuote(bookingId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY }),
  })
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, action }: { bookingId: number; action: BookingStatusAction }) =>
      updateBookingStatus(bookingId, action),
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
