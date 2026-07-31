export type ActivityEvent = 'created' | 'updated' | 'deleted' | string

export interface ActivityLog {
  id: number
  log_name: string | null
  description: string
  event: ActivityEvent
  subject_type: string | null
  subject_id: number | null
  causer: { id: number; name: string | null } | null
  properties: Record<string, unknown> | unknown[]
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    per_page: number
    total: number
  }
}
