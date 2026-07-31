import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCmsPage,
  createLegalDocument,
  createNotificationTemplate,
  deleteCmsPage,
  deleteNotificationTemplate,
  fetchCmsPages,
  fetchLegalDocuments,
  fetchNotificationTemplates,
  publishLegalDocument,
  updateCmsPage,
  updateNotificationTemplate,
  type CmsPagePayload,
  type LegalDocumentPayload,
  type NotificationTemplatePayload,
} from '../api/content-api'

const CMS_PAGES_KEY = ['admin', 'cms-pages'] as const
const LEGAL_DOCUMENTS_KEY = ['admin', 'legal-documents'] as const
const NOTIFICATION_TEMPLATES_KEY = ['admin', 'notification-templates'] as const

// --- CMS pages ---

export function useCmsPages() {
  return useQuery({ queryKey: CMS_PAGES_KEY, queryFn: fetchCmsPages })
}

export function useCreateCmsPage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CmsPagePayload) => createCmsPage(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CMS_PAGES_KEY }),
  })
}

export function useUpdateCmsPage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CmsPagePayload }) => updateCmsPage(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CMS_PAGES_KEY }),
  })
}

export function useDeleteCmsPage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteCmsPage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CMS_PAGES_KEY }),
  })
}

// --- Legal documents ---

export function useLegalDocuments() {
  return useQuery({ queryKey: LEGAL_DOCUMENTS_KEY, queryFn: fetchLegalDocuments })
}

export function useCreateLegalDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: LegalDocumentPayload) => createLegalDocument(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEGAL_DOCUMENTS_KEY }),
  })
}

export function usePublishLegalDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => publishLegalDocument(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEGAL_DOCUMENTS_KEY }),
  })
}

// --- Notification templates ---

export function useNotificationTemplates() {
  return useQuery({ queryKey: NOTIFICATION_TEMPLATES_KEY, queryFn: fetchNotificationTemplates })
}

export function useCreateNotificationTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: NotificationTemplatePayload) => createNotificationTemplate(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATION_TEMPLATES_KEY }),
  })
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: NotificationTemplatePayload }) =>
      updateNotificationTemplate(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATION_TEMPLATES_KEY }),
  })
}

export function useDeleteNotificationTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteNotificationTemplate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATION_TEMPLATES_KEY }),
  })
}
