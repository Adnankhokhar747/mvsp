import { apiClient, primeCsrfCookie } from '../../../shared/lib/api-client'
import type { LoginPayload, RegisterPayload, UpdateProfilePayload, User, VerifyOtpPayload } from '../types'

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await apiClient.post<{ data: User }>('/auth/register', payload)
  return data.data
}

export async function sendOtp(email: string, purpose: VerifyOtpPayload['purpose']): Promise<void> {
  await apiClient.post('/auth/otp/send', { email, purpose })
}

export async function verifyOtp(payload: VerifyOtpPayload): Promise<User> {
  const { data } = await apiClient.post<{ data: User }>('/auth/otp/verify', payload)
  return data.data
}

export async function login(payload: LoginPayload): Promise<User> {
  await primeCsrfCookie()
  const { data } = await apiClient.post<{ data: User }>('/auth/login', payload)
  return data.data
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function fetchMe(): Promise<User> {
  const { data } = await apiClient.get<{ data: User }>('/me')
  return data.data
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await apiClient.patch<{ data: User }>('/me', payload)
  return data.data
}
