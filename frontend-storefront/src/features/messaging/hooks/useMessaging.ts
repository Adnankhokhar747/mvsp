import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchConversation,
  fetchConversations,
  fetchMessages,
  sendMessage,
  startConversation,
} from '../api/messaging-api'

const CONVERSATIONS_KEY = ['conversations'] as const

export function useConversations(page: number) {
  return useQuery({
    queryKey: [...CONVERSATIONS_KEY, page],
    queryFn: () => fetchConversations(page),
    placeholderData: keepPreviousData,
    refetchInterval: 15_000,
  })
}

export function useConversation(id: number | undefined) {
  return useQuery({
    queryKey: [...CONVERSATIONS_KEY, 'detail', id],
    queryFn: () => fetchConversation(id as number),
    enabled: id !== undefined,
  })
}

export function useMessages(conversationId: number | undefined) {
  return useQuery({
    queryKey: [...CONVERSATIONS_KEY, conversationId, 'messages'],
    queryFn: () => fetchMessages(conversationId as number),
    enabled: conversationId !== undefined,
    refetchInterval: 5_000,
  })
}

export function useStartConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ vendorId, message, bookingId }: { vendorId: number; message: string; bookingId?: number }) =>
      startConversation(vendorId, message, bookingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY }),
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, body }: { conversationId: number; body: string }) =>
      sendMessage(conversationId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...CONVERSATIONS_KEY, variables.conversationId, 'messages'] })
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY })
    },
  })
}
