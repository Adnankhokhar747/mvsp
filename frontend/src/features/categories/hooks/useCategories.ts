import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCategory,
  deleteCategory,
  fetchAdminCategories,
  updateCategory,
} from '../api/categories-api'
import type { CategoryFormValues } from '../types'

const CATEGORIES_KEY = ['admin', 'categories'] as const

export function useAdminCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: fetchAdminCategories,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CategoryFormValues) => createCategory(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CategoryFormValues> }) =>
      updateCategory(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  })
}
