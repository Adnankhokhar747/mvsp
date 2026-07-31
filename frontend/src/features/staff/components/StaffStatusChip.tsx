import Chip from '@mui/material/Chip'
import type { StaffStatus } from '../types'

const CONFIG: Record<string, { label: string; color: 'success' | 'default' }> = {
  active: { label: 'Active', color: 'success' },
  suspended: { label: 'Suspended', color: 'default' },
}

export function StaffStatusChip({ status }: { status: StaffStatus }) {
  const config = CONFIG[status] ?? { label: status, color: 'default' as const }
  return <Chip size="small" label={config.label} color={config.color} variant="outlined" />
}
