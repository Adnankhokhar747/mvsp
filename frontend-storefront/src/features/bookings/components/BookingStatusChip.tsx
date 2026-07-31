import Chip from '@mui/material/Chip'
import type { BookingStatus } from '../types'

const CONFIG: Record<BookingStatus, { label: string; color: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  pending: { label: 'Pending', color: 'warning' },
  quoted: { label: 'Quoted', color: 'info' },
  confirmed: { label: 'Confirmed', color: 'info' },
  in_progress: { label: 'In Progress', color: 'info' },
  completed: { label: 'Completed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'default' },
  disputed: { label: 'Disputed', color: 'error' },
  refunded: { label: 'Refunded', color: 'default' },
}

export function BookingStatusChip({ status }: { status: BookingStatus }) {
  const config = CONFIG[status]
  return <Chip size="small" label={config.label} color={config.color} variant="outlined" />
}
