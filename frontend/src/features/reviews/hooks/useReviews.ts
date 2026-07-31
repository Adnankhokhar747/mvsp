import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchReviews, moderateReview, type ReviewListParams } from '../api/reviews-api'
import type { ReviewStatus } from '../types'

const REVIEWS_KEY = ['admin', 'reviews'] as const

export function useReviews(params: ReviewListParams) {
  return useQuery({
    queryKey: [...REVIEWS_KEY, params],
    queryFn: () => fetchReviews(params),
    placeholderData: keepPreviousData,
  })
}

export function useModerateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ReviewStatus }) => moderateReview(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: REVIEWS_KEY }),
  })
}
