import { apiClient } from '../../../shared/lib/api-client'
import type { Category } from '../types'

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<{ data: Category[] }>('/categories')
  return data.data
}

export async function fetchCategory(slug: string): Promise<Category> {
  const { data } = await apiClient.get<{ data: Category }>(`/categories/${slug}`)
  return data.data
}
