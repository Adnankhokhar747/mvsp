export type StaffStatus = 'active' | 'suspended' | string

export interface StaffMember {
  id: number
  name: string
  email: string
  phone: string | null
  status: StaffStatus
  roles: string[]
  email_verified_at: string | null
  created_at: string
}

export interface PlatformRole {
  name: string
  permissions_count: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    per_page: number
    total: number
  }
}
