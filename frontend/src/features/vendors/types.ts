export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'suspended'

export interface Vendor {
  id: number
  business_name: string
  slug: string
  description: string | null
  logo_path: string | null
  cover_path: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  status: VendorStatus
  rejection_reason?: string | null
  approved_at: string | null
  currency_code: string
  timezone: string
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
