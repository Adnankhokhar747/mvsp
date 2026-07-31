import Chip from '@mui/material/Chip'
import type { VendorStatus } from '../types'

const CONFIG: Record<VendorStatus, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
  pending: { label: 'Pending approval', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' },
  suspended: { label: 'Suspended', color: 'error' },
}

export function VendorStatusChip({ status }: { status: VendorStatus }) {
  const config = CONFIG[status]
  return <Chip size="small" label={config.label} color={config.color} variant="outlined" />
}
