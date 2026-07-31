import { apiClient } from '../../../shared/lib/api-client'
import type { BankAccount, LedgerEntry, PaginatedResponse, PayoutRequest, Wallet } from '../types'

export async function fetchWallet(): Promise<Wallet> {
  const { data } = await apiClient.get<{ data: Wallet }>('/vendor/wallet')
  return data.data
}

export async function fetchLedger(page: number): Promise<PaginatedResponse<LedgerEntry>> {
  const { data } = await apiClient.get<PaginatedResponse<LedgerEntry>>('/vendor/wallet/ledger', { params: { page } })
  return data
}

export async function fetchBankAccounts(): Promise<BankAccount[]> {
  const { data } = await apiClient.get<{ data: BankAccount[] }>('/vendor/bank-accounts')
  return data.data
}

export interface BankAccountPayload {
  account_holder_name: string
  account_number: string
  bank_name: string
  iban_or_routing?: string
  is_default?: boolean
}

export async function createBankAccount(payload: BankAccountPayload): Promise<BankAccount> {
  const { data } = await apiClient.post<{ data: BankAccount }>('/vendor/bank-accounts', payload)
  return data.data
}

export async function deleteBankAccount(id: number): Promise<void> {
  await apiClient.delete(`/vendor/bank-accounts/${id}`)
}

export async function requestPayout(amount: number, vendorBankAccountId: number | null): Promise<PayoutRequest> {
  const { data } = await apiClient.post<{ data: PayoutRequest }>('/vendor/payouts', {
    amount,
    vendor_bank_account_id: vendorBankAccountId,
  })
  return data.data
}
