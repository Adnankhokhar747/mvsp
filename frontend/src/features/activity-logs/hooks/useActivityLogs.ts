import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchActivityLogs, type ActivityLogListParams } from '../api/activity-logs-api'

const ACTIVITY_LOGS_KEY = ['admin', 'activity-logs'] as const

export function useActivityLogs(params: ActivityLogListParams) {
  return useQuery({
    queryKey: [...ACTIVITY_LOGS_KEY, params],
    queryFn: () => fetchActivityLogs(params),
    placeholderData: keepPreviousData,
  })
}
