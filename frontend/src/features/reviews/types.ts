export type ReviewStatus = 'published' | 'hidden' | 'flagged'

export interface Review {
  id: number
  booking_id: number
  rating: number
  title: string | null
  comment: string | null
  vendor_reply: string | null
  vendor_replied_at: string | null
  status: ReviewStatus
  customer?: { id: number; name: string }
  vendor?: { id: number; business_name: string }
  service?: { id: number; title: string }
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    per_page: number
    total: number
  }
}
