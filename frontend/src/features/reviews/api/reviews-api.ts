import { apiClient } from '../../../shared/lib/api-client'
import type { PaginatedResponse, Review, ReviewStatus } from '../types'

export interface ReviewListParams {
  page?: number
  status?: ReviewStatus | 'all'
}

export async function fetchReviews(params: ReviewListParams): Promise<PaginatedResponse<Review>> {
  const { data } = await apiClient.get<PaginatedResponse<Review>>('/admin/reviews', {
    params: {
      page: params.page,
      ...(params.status && params.status !== 'all' ? { 'filter[status]': params.status } : {}),
    },
  })
  return data
}

export async function moderateReview(id: number, status: ReviewStatus): Promise<Review> {
  const { data } = await apiClient.post<{ data: Review }>(`/admin/reviews/${id}/moderate`, { status })
  return data.data
}
