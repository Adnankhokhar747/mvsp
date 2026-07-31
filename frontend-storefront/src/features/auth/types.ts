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

export interface RegisterPayload {
  name: string
  email: string
  phone?: string
  password: string
  password_confirmation: string
  role: 'customer'
}

export interface VerifyOtpPayload {
  email: string
  purpose: 'email_verification' | 'phone_verification' | 'password_reset'
  code: string
}

export interface UpdateProfilePayload {
  name?: string
  phone?: string | null
  locale?: string
  timezone?: string
}
