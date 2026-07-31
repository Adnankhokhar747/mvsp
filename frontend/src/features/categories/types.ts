export type AttributeType = 'text' | 'number' | 'select' | 'boolean' | 'date'

export interface CategoryAttribute {
  key: string
  label: string
  type: AttributeType
  required: boolean
  options?: string[]
}

export interface Category {
  id: number
  parent_id: number | null
  name: string
  slug: string
  icon_path: string | null
  image_path: string | null
  description: string | null
  attribute_schema: CategoryAttribute[] | null
  booking_mode_allowed: Array<'slot' | 'request'>
  sort_order: number
  is_active: boolean
  seo_meta: Record<string, unknown> | null
  children?: Category[]
}

export interface CategoryFormValues {
  parent_id: number | null
  name: string
  description: string
  attribute_schema: CategoryAttribute[]
  booking_mode_allowed: Array<'slot' | 'request'>
  is_active: boolean
}
