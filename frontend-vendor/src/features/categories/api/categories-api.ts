import { apiClient } from '../../../shared/lib/api-client'
import type { Category } from '../types'

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<{ data: Category[] }>('/categories')
  return data.data
}

/** Flattens the (currently one-level) category tree into a single list for select inputs. */
export function flattenCategories(categories: Category[]): Category[] {
  return categories.flatMap((category) => [category, ...flattenCategories(category.children)])
}
