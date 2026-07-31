import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createBankAccount,
  deleteBankAccount,
  fetchBankAccounts,
  fetchLedger,
  fetchWallet,
  requestPayout,
  type BankAccountPayload,
} from '../api/wallet-api'

const WALLET_KEY = ['wallet'] as const
const LEDGER_KEY = ['wallet', 'ledger'] as const
const BANK_ACCOUNTS_KEY = ['bank-accounts'] as const

export function useWallet() {
  return useQuery({ queryKey: WALLET_KEY, queryFn: fetchWallet })
}

export function useLedger(page: number) {
  return useQuery({
    queryKey: [...LEDGER_KEY, page],
    queryFn: () => fetchLedger(page),
    placeholderData: keepPreviousData,
  })
}

export function useBankAccounts() {
  return useQuery({ queryKey: BANK_ACCOUNTS_KEY, queryFn: fetchBankAccounts })
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BankAccountPayload) => createBankAccount(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_KEY }),
  })
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteBankAccount(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_KEY }),
  })
}

export function useRequestPayout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ amount, bankAccountId }: { amount: number; bankAccountId: number | null }) =>
      requestPayout(amount, bankAccountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLET_KEY })
      queryClient.invalidateQueries({ queryKey: LEDGER_KEY })
    },
  })
}
