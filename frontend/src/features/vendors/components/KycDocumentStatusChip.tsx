import Chip from '@mui/material/Chip'
import type { KycDocumentStatus } from '../types'

const CONFIG: Record<KycDocumentStatus, { label: string; color: 'success' | 'warning' | 'error' }> = {
  pending: { label: 'Pending', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' },
}

export function KycDocumentStatusChip({ status }: { status: KycDocumentStatus }) {
  const config = CONFIG[status]
  return <Chip size="small" label={config.label} color={config.color} variant="outlined" />
}
