import { apiClient } from '../../../shared/lib/api-client'
import type { BillingCycle, PlanFeature, PlanFeatureType, SubscriptionPlan } from '../types'

export async function fetchPlanFeatures(): Promise<PlanFeature[]> {
  const { data } = await apiClient.get<{ data: PlanFeature[] }>('/admin/plan-features')
  return data.data
}

export interface CreatePlanFeaturePayload {
  key: string
  label: string
  type: PlanFeatureType
  description?: string
}

export async function createPlanFeature(payload: CreatePlanFeaturePayload): Promise<PlanFeature> {
  const { data } = await apiClient.post<{ data: PlanFeature }>('/admin/plan-features', payload)
  return data.data
}

export interface UpdatePlanFeaturePayload {
  label?: string
  description?: string | null
}

export async function updatePlanFeature(id: number, payload: UpdatePlanFeaturePayload): Promise<PlanFeature> {
  const { data } = await apiClient.patch<{ data: PlanFeature }>(`/admin/plan-features/${id}`, payload)
  return data.data
}

export async function fetchPlans(): Promise<SubscriptionPlan[]> {
  const { data } = await apiClient.get<{ data: SubscriptionPlan[] }>('/admin/subscription-plans')
  return data.data
}

export interface PlanPayload {
  name?: string
  description?: string | null
  price?: number
  currency_code?: string
  billing_cycle?: BillingCycle
  trial_days?: number
  is_active?: boolean
  is_default?: boolean
  sort_order?: number
  values?: Record<string, number | boolean>
}

export async function createPlan(payload: PlanPayload): Promise<SubscriptionPlan> {
  const { data } = await apiClient.post<{ data: SubscriptionPlan }>('/admin/subscription-plans', payload)
  return data.data
}

export async function updatePlan(id: number, payload: PlanPayload): Promise<SubscriptionPlan> {
  const { data } = await apiClient.patch<{ data: SubscriptionPlan }>(`/admin/subscription-plans/${id}`, payload)
  return data.data
}

export async function deletePlan(id: number): Promise<void> {
  await apiClient.delete(`/admin/subscription-plans/${id}`)
}
