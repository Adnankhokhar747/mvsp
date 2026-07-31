export type ServiceStatus = 'draft' | 'active' | 'paused' | 'rejected'
export type PriceType = 'fixed' | 'hourly' | 'quote'

export interface ServiceMedia {
  id: number
  url: string
  mime_type: string
}

export interface ServicePackage {
  id: number
  name: string
  price: number
  duration_minutes: number | null
  description: string | null
  sort_order: number
}

export interface ServiceAvailabilitySlot {
  id?: number
  staff_id: number | null
  day_of_week: number | null
  specific_date: string | null
  start_time: string
  end_time: string
  is_recurring: boolean
}

export interface Service {
  id: number
  vendor_id: number
  category_id: number
  title: string
  slug: string
  short_description: string | null
  description: string | null
  base_price: number
  currency_code: string
  price_type: PriceType
  duration_minutes: number | null
  attributes: Record<string, unknown> | null
  status: ServiceStatus
  is_featured: boolean
  featured_until: string | null
  avg_rating: number
  review_count: number
  media: ServiceMedia[]
  packages: ServicePackage[]
  availability: ServiceAvailabilitySlot[]
  vendor?: { id: number; business_name: string; slug: string }
  category?: { id: number; name: string; slug: string }
  created_at: string
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
