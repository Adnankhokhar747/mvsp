export type PayoutStatus = 'pending' | 'paid' | 'rejected' | string

export interface PayoutBankAccount {
  account_holder_name: string
  bank_name: string
  account_number: string
  iban_or_routing: string
}

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
  vendor?: { id: number; business_name: string }
  bank_account?: PayoutBankAccount | null
  processed_by?: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    per_page: number
    total: number
  }
}
