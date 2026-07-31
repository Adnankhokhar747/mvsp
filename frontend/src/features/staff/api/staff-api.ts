import { apiClient } from '../../../shared/lib/api-client'
import type { PaginatedResponse, PlatformRole, StaffMember, StaffStatus } from '../types'

export interface StaffListParams {
  page?: number
  status?: StaffStatus | 'all'
  role?: string | 'all'
}

export async function fetchStaff(params: StaffListParams): Promise<PaginatedResponse<StaffMember>> {
  const { data } = await apiClient.get<PaginatedResponse<StaffMember>>('/admin/staff', {
    params: {
      page: params.page,
      ...(params.status && params.status !== 'all' ? { 'filter[status]': params.status } : {}),
      ...(params.role && params.role !== 'all' ? { 'filter[role]': params.role } : {}),
    },
  })
  return data
}

export async function fetchPlatformRoles(): Promise<PlatformRole[]> {
  const { data } = await apiClient.get<{ data: PlatformRole[] }>('/admin/staff-roles')
  return data.data
}

export interface CreateStaffPayload {
  name: string
  email: string
  password: string
  role: string
}

export async function createStaff(payload: CreateStaffPayload): Promise<StaffMember> {
  const { data } = await apiClient.post<{ data: StaffMember }>('/admin/staff', payload)
  return data.data
}

export async function updateStaffRole(id: number, role: string): Promise<StaffMember> {
  const { data } = await apiClient.patch<{ data: StaffMember }>(`/admin/staff/${id}/role`, { role })
  return data.data
}

export async function suspendStaff(id: number, reason?: string): Promise<StaffMember> {
  const { data } = await apiClient.post<{ data: StaffMember }>(`/admin/staff/${id}/suspend`, { reason })
  return data.data
}

export async function reactivateStaff(id: number): Promise<StaffMember> {
  const { data } = await apiClient.post<{ data: StaffMember }>(`/admin/staff/${id}/reactivate`)
  return data.data
}
