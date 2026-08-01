import type { Address } from '../addresses/types'

export type BookingStatus =
  | 'pending'
  | 'quoted'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed'
  | 'refunded'

export type BookingMode = 'slot' | 'request'

export interface BookingQuote {
  id: number
  booking_id: number
  quoted_price: number
  quoted_duration: number | null
  message: string | null
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  expires_at: string | null
  created_at: string
}

export interface BookingStatusHistoryEntry {
  from_status: string | null
  to_status: string
  note: string | null
  created_at: string
}

export interface Review {
  id: number
  booking_id: number
  rating: number
  title: string | null
  comment: string | null
  vendor_reply: string | null
  vendor_replied_at: string | null
  status: string
  created_at: string
}

export interface Booking {
  id: number
  booking_number: string
  customer_id: number
  vendor_id: number
  service_id: number
  service_package_id: number | null
  staff_id: number | null
  booking_mode: BookingMode
  scheduled_at: string | null
  duration_minutes: number | null
  address_id: number | null
  address?: Address | null
  status: BookingStatus
  price: number | null
  currency_code: string
  cancellation_reason: string | null
  cancelled_at: string | null
  rescheduled_from_id: number | null
  notes: string | null
  quotes: BookingQuote[]
  service?: { id: number; title: string }
  vendor?: { id: number; business_name: string }
  status_history?: BookingStatusHistoryEntry[]
  review?: Review | null
  refund_percentage?: number
  created_at: string
}

export interface AvailabilitySlot {
  start: string
  end: string
  staff_id: number | null
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
