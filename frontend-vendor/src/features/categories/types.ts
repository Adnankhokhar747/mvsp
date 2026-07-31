export interface CategoryAttributeField {
  key: string
  label: string
  type: 'select' | 'boolean' | 'number' | 'text'
  required?: boolean
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
  attribute_schema: CategoryAttributeField[]
  booking_mode_allowed: string[]
  sort_order: number
  is_active: boolean
  seo_meta: Record<string, unknown> | null
  children: Category[]
}
