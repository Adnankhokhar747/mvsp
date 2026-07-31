import Chip from '@mui/material/Chip'
import type { VendorStatus } from '../types'

const CONFIG: Record<VendorStatus, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
  approved: { label: 'Approved', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  rejected: { label: 'Rejected', color: 'error' },
  suspended: { label: 'Suspended', color: 'default' },
}

export function VendorStatusChip({ status }: { status: VendorStatus }) {
  const config = CONFIG[status]
  return <Chip size="small" label={config.label} color={config.color} variant="outlined" />
}
