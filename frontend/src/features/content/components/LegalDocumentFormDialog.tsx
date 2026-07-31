import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import { useCreateLegalDocument } from '../hooks/useContent'
import { extractErrorMessage } from '../../../shared/lib/api-client'

interface LegalDocumentFormDialogProps {
  open: boolean
  onClose: () => void
  onNotify: (message: string, severity: 'success' | 'error') => void
}

const TYPE_SUGGESTIONS = ['terms_of_service', 'privacy_policy', 'refund_policy', 'cookie_policy']

export function LegalDocumentFormDialog({ open, onClose, onNotify }: LegalDocumentFormDialogProps) {
  const createMutation = useCreateLegalDocument()

  const [type, setType] = useState('')
  const [version, setVersion] = useState('')
  const [content, setContent] = useState('')

  const reset = () => {
    setType('')
    setVersion('')
    setContent('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSave = async () => {
    if (!type.trim() || !version.trim() || !content.trim()) {
      onNotify('Type, version, and content are all required.', 'error')
      return
    }

    try {
      await createMutation.mutateAsync({ type, version, content })
      onNotify('Draft version created. Publish it when ready.', 'success')
      handleClose()
    } catch (error) {
      onNotify(extractErrorMessage(error), 'error')
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>New legal document version</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField select label="Type" size="small" fullWidth value={type} onChange={(e) => setType(e.target.value)}>
            {TYPE_SUGGESTIONS.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Version"
            size="small"
            fullWidth
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            helperText="e.g. 1.0, 2024-01, v2"
          />
          <TextField
            label="Content"
            size="small"
            fullWidth
            multiline
            minRows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={createMutation.isPending}>
          Save draft
        </Button>
      </DialogActions>
    </Dialog>
  )
}
