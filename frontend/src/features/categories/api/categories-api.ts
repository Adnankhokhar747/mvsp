import { apiClient } from '../../../shared/lib/api-client'
import type { Category, CategoryFormValues } from '../types'

export async function fetchAdminCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<{ data: Category[] }>('/admin/categories')
  return data.data
}

export async function createCategory(payload: CategoryFormValues): Promise<Category> {
  const { data } = await apiClient.post<{ data: Category }>('/admin/categories', payload)
  return data.data
}

export async function updateCategory(id: number, payload: Partial<CategoryFormValues>): Promise<Category> {
  const { data } = await apiClient.patch<{ data: Category }>(`/admin/categories/${id}`, payload)
  return data.data
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/admin/categories/${id}`)
}
