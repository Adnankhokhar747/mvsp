export interface CategoryAttributeSchemaField {
  key: string
  label: string
  type: string
  required?: boolean
}

export interface Category {
  id: number
  parent_id: number | null
  name: string
  slug: string
  icon_path: string | null
  image_path: string | null
  description: string | null
  attribute_schema: CategoryAttributeSchemaField[]
  booking_mode_allowed: string[]
  sort_order: number
  is_active: boolean
  seo_meta: Record<string, unknown> | null
  children: Category[]
}
