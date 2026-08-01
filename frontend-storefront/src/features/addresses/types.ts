export interface Address {
  id: number
  label: string | null
  line1: string
  line2: string | null
  city: string
  state: string | null
  country_code: string
  postal_code: string | null
  lat: number | null
  lng: number | null
  is_default: boolean
}
