export interface CmsPage {
  id: number
  slug: string
  title: string
  content: string | null
  locale: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface LegalDocument {
  id: number
  type: string
  version: string
  content: string
  published_at: string | null
  created_at: string
}

export type NotificationChannel = 'email' | 'sms' | 'push'

export interface NotificationTemplate {
  id: number
  key: string
  channel: NotificationChannel
  locale: string
  subject: string | null
  body: string
  is_active: boolean
  created_at: string
}
