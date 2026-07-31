import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

interface FeatureServiceDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (featuredDays: number) => void
  isSubmitting?: boolean
}

export function FeatureServiceDialog({ open, onClose, onConfirm, isSubmitting }: FeatureServiceDialogProps) {
  const [days, setDays] = useState('30')

  const handleConfirm = () => {
    const value = Number(days)
    if (!value || value < 1) return
    onConfirm(value)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Feature this service</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          type="number"
          label="Featured for how many days?"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          slotProps={{ htmlInput: { min: 1, max: 365 } }}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleConfirm} disabled={!Number(days) || isSubmitting}>
          Feature
        </Button>
      </DialogActions>
    </Dialog>
  )
}
