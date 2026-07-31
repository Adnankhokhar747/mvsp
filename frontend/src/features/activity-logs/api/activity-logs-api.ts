import { apiClient } from '../../../shared/lib/api-client'
import type { ActivityEvent, PaginatedResponse, ActivityLog } from '../types'

export interface ActivityLogListParams {
  page?: number
  subjectType?: string | 'all'
  event?: ActivityEvent | 'all'
}

export async function fetchActivityLogs(params: ActivityLogListParams): Promise<PaginatedResponse<ActivityLog>> {
  const { data } = await apiClient.get<PaginatedResponse<ActivityLog>>('/admin/activity-logs', {
    params: {
      page: params.page,
      ...(params.subjectType && params.subjectType !== 'all' ? { 'filter[subject_type]': params.subjectType } : {}),
      ...(params.event && params.event !== 'all' ? { 'filter[event]': params.event } : {}),
    },
  })
  return data
}
