export type TransactionStatus = 'pending' | 'success' | 'refunded' | 'failed' | string

export interface Refund {
  id: number
  transaction_id: number
  amount: number
  reason: string | null
  status: string
  processed_at: string | null
}

export interface Transaction {
  id: number
  transaction_number: string
  payable_type: string
  payable_id: number
  user_id: number
  vendor_id: number | null
  type: string
  amount: number
  currency_code: string
  status: TransactionStatus
  gateway?: string
  meta?: Record<string, unknown>
  user?: { id: number; name: string; email: string }
  vendor?: { id: number; business_name: string } | null
  refunds?: Refund[]
  refunded_amount?: number
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    per_page: number
    total: number
  }
}
