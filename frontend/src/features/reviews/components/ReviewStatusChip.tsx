import Chip from '@mui/material/Chip'
import type { ReviewStatus } from '../types'

const CONFIG: Record<ReviewStatus, { label: string; color: 'success' | 'warning' | 'default' }> = {
  published: { label: 'Published', color: 'success' },
  hidden: { label: 'Hidden', color: 'default' },
  flagged: { label: 'Flagged', color: 'warning' },
}

export function ReviewStatusChip({ status }: { status: ReviewStatus }) {
  const config = CONFIG[status]
  return <Chip size="small" label={config.label} color={config.color} variant="outlined" />
}
