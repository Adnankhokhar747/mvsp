export type PlanFeatureType = 'limit' | 'boolean'

export interface PlanFeature {
  id: number
  key: string
  label: string
  type: PlanFeatureType
  description: string | null
}

export type BillingCycle = 'monthly' | 'yearly' | 'lifetime'

export interface SubscriptionPlan {
  id: number
  name: string
  slug: string
  description: string | null
  price: number
  currency_code: string
  billing_cycle: BillingCycle
  trial_days: number
  is_active: boolean
  is_default: boolean
  sort_order: number
  features: Record<string, number | boolean>
}
