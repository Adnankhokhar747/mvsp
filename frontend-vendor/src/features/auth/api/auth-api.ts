import { apiClient, primeCsrfCookie } from '../../../shared/lib/api-client'
import type { LoginPayload, User } from '../types'

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
