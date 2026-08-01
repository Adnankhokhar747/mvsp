import { apiClient } from '../../../shared/lib/api-client'
import type { Conversation, Message, PaginatedResponse } from '../types'

export async function fetchConversations(page: number): Promise<PaginatedResponse<Conversation>> {
  const { data } = await apiClient.get<PaginatedResponse<Conversation>>('/conversations', { params: { page } })
  return data
}

export async function fetchConversation(id: number): Promise<Conversation> {
  const { data } = await apiClient.get<{ data: Conversation }>(`/conversations/${id}`)
  return data.data
}

export async function fetchMessages(conversationId: number): Promise<PaginatedResponse<Message>> {
  const { data } = await apiClient.get<PaginatedResponse<Message>>(`/conversations/${conversationId}/messages`)
  return data
}

export async function startConversation(
  vendorId: number,
  message: string,
  bookingId?: number,
): Promise<Conversation> {
  const { data } = await apiClient.post<{ data: Conversation }>('/conversations', {
    vendor_id: vendorId,
    message,
    ...(bookingId ? { booking_id: bookingId } : {}),
  })
  return data.data
}

export async function sendMessage(conversationId: number, body: string): Promise<Message> {
  const { data } = await apiClient.post<{ data: Message }>(`/conversations/${conversationId}/messages`, { body })
  return data.data
}
