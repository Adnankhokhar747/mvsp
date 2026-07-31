import Chip from '@mui/material/Chip'
import type { ServiceStatus } from '../types'

const CONFIG: Record<ServiceStatus, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
  draft: { label: 'Draft', color: 'default' },
  active: { label: 'Active', color: 'success' },
  paused: { label: 'Paused', color: 'warning' },
  rejected: { label: 'Rejected', color: 'error' },
}

export function ServiceStatusChip({ status }: { status: ServiceStatus }) {
  const config = CONFIG[status]
  return <Chip size="small" label={config.label} color={config.color} variant="outlined" />
}
