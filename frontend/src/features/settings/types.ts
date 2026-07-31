export interface PaymentGateway {
  id: number
  driver: string
  name: string
  is_active: boolean
  is_default: boolean
  sort_order: number
}
