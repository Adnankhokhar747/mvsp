import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPlan,
  createPlanFeature,
  deletePlan,
  fetchPlanFeatures,
  fetchPlans,
  updatePlan,
  updatePlanFeature,
  type CreatePlanFeaturePayload,
  type PlanPayload,
  type UpdatePlanFeaturePayload,
} from '../api/plans-api'

const PLANS_KEY = ['subscription-plans'] as const
const FEATURES_KEY = ['plan-features'] as const

export function usePlanFeatures() {
  return useQuery({
    queryKey: FEATURES_KEY,
    queryFn: fetchPlanFeatures,
  })
}

export function useCreatePlanFeature() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePlanFeaturePayload) => createPlanFeature(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FEATURES_KEY }),
  })
}

export function useUpdatePlanFeature() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePlanFeaturePayload }) => updatePlanFeature(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FEATURES_KEY }),
  })
}

export function usePlans() {
  return useQuery({
    queryKey: PLANS_KEY,
    queryFn: fetchPlans,
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: PlanPayload) => createPlan(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PLANS_KEY }),
  })
}

export function useUpdatePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PlanPayload }) => updatePlan(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PLANS_KEY }),
  })
}

export function useDeletePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deletePlan(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PLANS_KEY }),
  })
}
