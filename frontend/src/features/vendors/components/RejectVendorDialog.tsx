import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

interface RejectVendorDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  isSubmitting?: boolean
}

export function RejectVendorDialog({ open, onClose, onConfirm, isSubmitting }: RejectVendorDialogProps) {
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    if (!reason.trim()) return
    onConfirm(reason.trim())
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Reject vendor application</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={3}
          label="Reason for rejection"
          placeholder="Explain what needs to change so the vendor can resubmit…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirm}
          disabled={!reason.trim() || isSubmitting}
        >
          Reject
        </Button>
      </DialogActions>
    </Dialog>
  )
}
