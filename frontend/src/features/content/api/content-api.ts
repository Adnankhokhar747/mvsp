import { apiClient } from '../../../shared/lib/api-client'
import type { CmsPage, LegalDocument, NotificationChannel, NotificationTemplate } from '../types'

// --- CMS pages ---

export async function fetchCmsPages(): Promise<CmsPage[]> {
  const { data } = await apiClient.get<{ data: CmsPage[] }>('/admin/cms-pages')
  return data.data
}

export interface CmsPagePayload {
  slug?: string
  title?: string
  content?: string | null
  locale?: string
  is_published?: boolean
}

export async function createCmsPage(payload: CmsPagePayload): Promise<CmsPage> {
  const { data } = await apiClient.post<{ data: CmsPage }>('/admin/cms-pages', payload)
  return data.data
}

export async function updateCmsPage(id: number, payload: CmsPagePayload): Promise<CmsPage> {
  const { data } = await apiClient.patch<{ data: CmsPage }>(`/admin/cms-pages/${id}`, payload)
  return data.data
}

export async function deleteCmsPage(id: number): Promise<void> {
  await apiClient.delete(`/admin/cms-pages/${id}`)
}

// --- Legal documents ---

export async function fetchLegalDocuments(): Promise<LegalDocument[]> {
  const { data } = await apiClient.get<{ data: LegalDocument[] }>('/admin/legal-documents')
  return data.data
}

export interface LegalDocumentPayload {
  type: string
  version: string
  content: string
}

export async function createLegalDocument(payload: LegalDocumentPayload): Promise<LegalDocument> {
  const { data } = await apiClient.post<{ data: LegalDocument }>('/admin/legal-documents', payload)
  return data.data
}

export async function publishLegalDocument(id: number): Promise<LegalDocument> {
  const { data } = await apiClient.post<{ data: LegalDocument }>(`/admin/legal-documents/${id}/publish`)
  return data.data
}

// --- Notification templates ---

export async function fetchNotificationTemplates(): Promise<NotificationTemplate[]> {
  const { data } = await apiClient.get<{ data: NotificationTemplate[] }>('/admin/notification-templates')
  return data.data
}

export interface NotificationTemplatePayload {
  key?: string
  channel?: NotificationChannel
  locale?: string
  subject?: string | null
  body?: string
  is_active?: boolean
}

export async function createNotificationTemplate(payload: NotificationTemplatePayload): Promise<NotificationTemplate> {
  const { data } = await apiClient.post<{ data: NotificationTemplate }>('/admin/notification-templates', payload)
  return data.data
}

export async function updateNotificationTemplate(
  id: number,
  payload: NotificationTemplatePayload,
): Promise<NotificationTemplate> {
  const { data } = await apiClient.patch<{ data: NotificationTemplate }>(`/admin/notification-templates/${id}`, payload)
  return data.data
}

export async function deleteNotificationTemplate(id: number): Promise<void> {
  await apiClient.delete(`/admin/notification-templates/${id}`)
}
