import { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import type { BankAccount } from '../types'

interface RequestPayoutDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (amount: number, bankAccountId: number | null) => void
  availableBalance: number
  currencyCode: string
  bankAccounts: BankAccount[]
  isSubmitting?: boolean
}

export function RequestPayoutDialog({
  open,
  onClose,
  onConfirm,
  availableBalance,
  currencyCode,
  bankAccounts,
  isSubmitting,
}: RequestPayoutDialogProps) {
  const [amount, setAmount] = useState('')
  const [bankAccountId, setBankAccountId] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)

  // The dialog is always mounted (only its `open` prop toggles visibility), so a
  // useState initializer would capture whatever bankAccounts looked like at first
  // render — often before the list has loaded — and never update after. Re-derive
  // the default selection each time the dialog is actually opened instead.
  useEffect(() => {
    if (open) {
      setBankAccountId(bankAccounts.find((a) => a.is_default)?.id ?? bankAccounts[0]?.id ?? '')
    }
  }, [open, bankAccounts])

  const availableDisplay = new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(
    availableBalance / 100,
  )

  const handleConfirm = () => {
    setError(null)
    const cents = Math.round(Number(amount) * 100)
    if (!amount || !cents || cents <= 0) {
      setError('Enter a valid amount.')
      return
    }
    if (cents > availableBalance) {
      setError('Amount exceeds your available balance.')
      return
    }
    onConfirm(cents, bankAccountId === '' ? null : bankAccountId)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Request a payout</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Available balance: {availableDisplay}
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          {!bankAccounts.length && (
            <Alert severity="warning">Add a bank account first so we know where to send your payout.</Alert>
          )}
          <TextField
            label={`Amount (${currencyCode})`}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            fullWidth
          />
          <TextField
            select
            label="Bank account"
            value={bankAccountId}
            onChange={(e) => setBankAccountId(e.target.value === '' ? '' : Number(e.target.value))}
            fullWidth
            disabled={!bankAccounts.length}
          >
            {bankAccounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.bank_name} ({account.account_holder_name})
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleConfirm} disabled={isSubmitting || !bankAccounts.length}>
          Request payout
        </Button>
      </DialogActions>
    </Dialog>
  )
}
