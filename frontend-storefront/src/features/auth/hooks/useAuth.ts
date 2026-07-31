import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { fetchMe, login, logout, register, sendOtp, updateProfile, verifyOtp } from '../api/auth-api'
import type { LoginPayload, RegisterPayload, UpdateProfilePayload, VerifyOtpPayload } from '../types'

export const ME_QUERY_KEY = ['auth', 'me'] as const

export function useMe() {
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    // A 401 just means "not logged in" — don't treat it as a loading error.
    throwOnError: (error) => !(axios.isAxiosError(error) && error.response?.status === 401),
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
  })
}

export function useSendOtp() {
  return useMutation({
    mutationFn: ({ email, purpose }: { email: string; purpose: VerifyOtpPayload['purpose'] }) =>
      sendOtp(email, purpose),
  })
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => verifyOtp(payload),
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(ME_QUERY_KEY, user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(ME_QUERY_KEY, null)
      queryClient.clear()
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(ME_QUERY_KEY, user)
    },
  })
}
