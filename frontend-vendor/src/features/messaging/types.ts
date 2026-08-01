export interface Conversation {
  id: number
  booking_id: number | null
  vendor_id: number
  customer_id: number
  last_message_at: string | null
  vendor?: { id: number; business_name: string; slug: string }
  customer?: { id: number; name: string }
  unread_count: number
  created_at: string
}

export interface Message {
  id: number
  conversation_id: number
  sender_id: number
  body: string | null
  attachment_path: string | null
  read_at: string | null
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
