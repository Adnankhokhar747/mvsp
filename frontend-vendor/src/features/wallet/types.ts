export interface Wallet {
  id: number
  vendor_id: number
  balance: number
  held_balance: number
  currency_code: string
}

export type LedgerEntryType = 'credit' | 'debit' | 'hold' | 'release'

export interface LedgerEntry {
  id: number
  type: LedgerEntryType
  amount: number
  balance_after: number
  reference_type: string | null
  reference_id: number | null
  description: string | null
  created_at: string
}

export interface BankAccount {
  id: number
  account_holder_name: string
  account_number: string
  bank_name: string
  iban_or_routing: string | null
  is_default: boolean
  created_at: string
}

export type PayoutStatus = 'pending' | 'paid' | 'rejected'

export interface PayoutRequest {
  id: number
  vendor_id: number
  amount: number
  currency_code: string
  method: string
  status: PayoutStatus
  requested_at: string
  processed_at: string | null
  rejection_reason: string | null
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
