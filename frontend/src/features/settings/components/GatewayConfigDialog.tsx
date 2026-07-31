import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import { useUpdatePaymentGateway } from '../hooks/useSettings'
import { extractErrorMessage } from '../../../shared/lib/api-client'
import type { PaymentGateway } from '../types'

interface GatewayConfigDialogProps {
  gateway: PaymentGateway | null
  onClose: () => void
  onNotify: (message: string, severity: 'success' | 'error') => void
}

export function GatewayConfigDialog({ gateway, onClose, onNotify }: GatewayConfigDialogProps) {
  const updateMutation = useUpdatePaymentGateway()
  const [configText, setConfigText] = useState('')

  const handleClose = () => {
    setConfigText('')
    onClose()
  }

  const handleSave = async () => {
    if (!gateway) return

    let config: Record<string, unknown> | undefined
    if (configText.trim()) {
      try {
        const parsed = JSON.parse(configText)
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error('not an object')
        }
        config = parsed
      } catch {
        onNotify('Configuration must be valid JSON (an object), e.g. {"api_key": "..."}.', 'error')
        return
      }
    }

    try {
      await updateMutation.mutateAsync({ id: gateway.id, payload: config ? { config } : {} })
      onNotify(`${gateway.name} configuration updated.`, 'success')
      handleClose()
    } catch (error) {
      onNotify(extractErrorMessage(error), 'error')
    }
  }

  return (
    <Dialog open={gateway !== null} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Configure {gateway?.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Gateway credentials are write-only and never sent back to the browser. Leave this blank to keep the
            existing configuration unchanged, or paste a JSON object to replace it entirely.
          </Typography>
          <TextField
            label="Configuration (JSON)"
            placeholder={'{\n  "api_key": "...",\n  "secret_key": "..."\n}'}
            multiline
            minRows={6}
            fullWidth
            value={configText}
            onChange={(e) => setConfigText(e.target.value)}
            slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: 13 } } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={updateMutation.isPending}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
