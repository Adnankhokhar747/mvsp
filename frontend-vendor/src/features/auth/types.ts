export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  user_type: 'admin' | 'vendor' | 'customer'
  status: string
  avatar_path: string | null
  locale: string
  timezone: string
  email_verified_at: string | null
  phone_verified_at: string | null
  roles?: string[]
  created_at: string
}

export interface LoginPayload {
  login: string
  password: string
  device_name?: string
}
