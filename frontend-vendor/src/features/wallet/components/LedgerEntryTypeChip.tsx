import Chip from '@mui/material/Chip'
import type { LedgerEntryType } from '../types'

const CONFIG: Record<LedgerEntryType, { label: string; color: 'success' | 'error' | 'warning' | 'info' }> = {
  credit: { label: 'Credit', color: 'success' },
  debit: { label: 'Debit', color: 'error' },
  hold: { label: 'Held', color: 'warning' },
  release: { label: 'Released', color: 'info' },
}

export function LedgerEntryTypeChip({ type }: { type: LedgerEntryType }) {
  const config = CONFIG[type]
  return <Chip size="small" label={config.label} color={config.color} variant="outlined" />
}
