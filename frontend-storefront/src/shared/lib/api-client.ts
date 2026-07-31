import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    Accept: 'application/json',
  },
})

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
