import { apiClient } from '../../../shared/lib/api-client'
import type { Address } from '../types'

export async function fetchAddresses(): Promise<Address[]> {
  const { data } = await apiClient.get<{ data: Address[] }>('/addresses')
  return data.data
}

export interface AddressPayload {
  label?: string
  line1: string
  line2?: string
  city: string
  state?: string
  country_code: string
  postal_code?: string
  is_default?: boolean
}

export async function createAddress(payload: AddressPayload): Promise<Address> {
  const { data } = await apiClient.post<{ data: Address }>('/addresses', payload)
  return data.data
}

export async function updateAddress(id: number, payload: Partial<AddressPayload>): Promise<Address> {
  const { data } = await apiClient.patch<{ data: Address }>(`/addresses/${id}`, payload)
  return data.data
}

export async function deleteAddress(id: number): Promise<void> {
  await apiClient.delete(`/addresses/${id}`)
}
