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
  status: string
  approved_at: string | null
  currency_code: string
  timezone: string
  created_at: string
}

export interface VendorReview {
  id: number
  rating: number
  title: string | null
  comment: string | null
  vendor_reply: string | null
  vendor_replied_at: string | null
  status: string
  customer?: { id: number; name: string }
  service?: { id: number; title: string }
  created_at: string
}
