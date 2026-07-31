import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createStaff,
  fetchPlatformRoles,
  fetchStaff,
  reactivateStaff,
  suspendStaff,
  updateStaffRole,
  type CreateStaffPayload,
  type StaffListParams,
} from '../api/staff-api'

const STAFF_KEY = ['admin', 'staff'] as const
const ROLES_KEY = ['admin', 'staff-roles'] as const

export function useStaffList(params: StaffListParams) {
  return useQuery({
    queryKey: [...STAFF_KEY, params],
    queryFn: () => fetchStaff(params),
    placeholderData: keepPreviousData,
  })
}

export function usePlatformRoles() {
  return useQuery({
    queryKey: ROLES_KEY,
    queryFn: fetchPlatformRoles,
  })
}

export function useCreateStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => createStaff(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAFF_KEY }),
  })
}

export function useUpdateStaffRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) => updateStaffRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAFF_KEY }),
  })
}

export function useSuspendStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => suspendStaff(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAFF_KEY }),
  })
}

export function useReactivateStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reactivateStaff(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAFF_KEY }),
  })
}
