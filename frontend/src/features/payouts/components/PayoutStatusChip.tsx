import Chip from '@mui/material/Chip'
import type { PayoutStatus } from '../types'

const CONFIG: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
  pending: { label: 'Pending', color: 'warning' },
  paid: { label: 'Paid', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' },
}

export function PayoutStatusChip({ status }: { status: PayoutStatus }) {
  const config = CONFIG[status] ?? { label: status, color: 'default' as const }
  return <Chip size="small" label={config.label} color={config.color} variant="outlined" />
}
