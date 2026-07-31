import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
})

/**
 * Sanctum's SPA cookie auth requires this hit once before any stateful
 * request (login, or any authenticated call) so the XSRF-TOKEN cookie exists.
 */
export function primeCsrfCookie() {
  return axios.get(`${API_URL}/sanctum/csrf-cookie`, { withCredentials: true })
}

export interface ApiErrorShape {
  message: string
  errors?: Record<string, string[]>
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorShape | undefined
    if (data?.message) {
      return data.message
    }
  }
  return 'Something went wrong. Please try again.'
}
