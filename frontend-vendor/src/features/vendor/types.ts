export type VendorRole = 'owner' | 'manager' | 'staff'
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
  rejection_reason: string | null
  approved_at: string | null
  currency_code: string
  timezone: string
  created_at: string
}

export interface MyVendor {
  vendor: Vendor
  role: VendorRole
}

export interface KycDocumentType {
  id: number
  name: string
  slug: string
  is_required: boolean
  applicable_country_code: string | null
  instructions: string | null
  is_active: boolean
}

export type KycDocumentStatus = 'pending' | 'approved' | 'rejected'

export interface KycDocument {
  id: number
  kyc_document_type_id: number
  document_type?: { id: number; name: string; slug: string }
  file_path: string
  status: KycDocumentStatus
  rejected_reason: string | null
  reviewed_at: string | null
  created_at: string
}

export interface StaffMember {
  id: number
  user_id: number
  name: string
  email: string
  role: VendorRole
  joined_at: string | null
}
