export type ServiceStatus = 'draft' | 'active' | 'paused' | 'rejected'
export type PriceType = 'fixed' | 'hourly' | 'quote'

export interface Service {
  id: number
  vendor_id: number
  category_id: number
  title: string
  slug: string
  short_description: string | null
  base_price: number
  currency_code: string
  price_type: PriceType
  status: ServiceStatus
  is_featured: boolean
  featured_until: string | null
  avg_rating: number
  review_count: number
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
