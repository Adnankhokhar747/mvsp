import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cancelBooking, fetchBooking, fetchBookings, type BookingListParams } from '../api/bookings-api'

const BOOKINGS_KEY = ['bookings'] as const

export function useBookings(params: BookingListParams) {
  return useQuery({
    queryKey: [...BOOKINGS_KEY, params],
    queryFn: () => fetchBookings(params),
    placeholderData: keepPreviousData,
  })
}

export function useBooking(id: number | null) {
  return useQuery({
    queryKey: [...BOOKINGS_KEY, 'detail', id],
    queryFn: () => fetchBooking(id as number),
    enabled: id !== null,
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => cancelBooking(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY }),
  })
}
