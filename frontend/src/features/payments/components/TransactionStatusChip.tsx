import Chip from '@mui/material/Chip'
import type { TransactionStatus } from '../types'

const CONFIG: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  pending: { label: 'Pending', color: 'warning' },
  success: { label: 'Success', color: 'success' },
  refunded: { label: 'Refunded', color: 'default' },
  failed: { label: 'Failed', color: 'error' },
}

export function TransactionStatusChip({ status }: { status: TransactionStatus }) {
  const config = CONFIG[status] ?? { label: status, color: 'default' as const }
  return <Chip size="small" label={config.label} color={config.color} variant="outlined" />
}
