import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createService,
  fetchVendorService,
  fetchVendorServices,
  setAvailability,
  updateService,
  uploadServiceMedia,
  type ServiceListParams,
  type ServicePayload,
} from '../api/services-api'
import type { ServiceAvailabilitySlot } from '../types'

const SERVICES_KEY = ['vendor-services'] as const

export function useVendorServices(params: ServiceListParams) {
  return useQuery({
    queryKey: [...SERVICES_KEY, params],
    queryFn: () => fetchVendorServices(params),
    placeholderData: keepPreviousData,
  })
}

export function useVendorService(id: number | undefined) {
  return useQuery({
    queryKey: [...SERVICES_KEY, 'detail', id],
    queryFn: () => fetchVendorService(id as number),
    enabled: id !== undefined,
  })
}

export function useCreateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ServicePayload) => createService(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SERVICES_KEY }),
  })
}

export function useUpdateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ServicePayload> }) => updateService(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SERVICES_KEY }),
  })
}

export function useUploadServiceMedia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => uploadServiceMedia(id, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SERVICES_KEY }),
  })
}

export function useSetAvailability() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, slots }: { id: number; slots: ServiceAvailabilitySlot[] }) => setAvailability(id, slots),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SERVICES_KEY }),
  })
}
