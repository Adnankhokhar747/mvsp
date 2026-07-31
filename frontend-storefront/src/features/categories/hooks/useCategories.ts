import { useQuery } from '@tanstack/react-query'
import { fetchCategories, fetchCategory } from '../api/categories-api'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })
}

export function useCategory(slug: string | undefined) {
  return useQuery({
    queryKey: ['categories', slug],
    queryFn: () => fetchCategory(slug as string),
    enabled: !!slug,
  })
}
