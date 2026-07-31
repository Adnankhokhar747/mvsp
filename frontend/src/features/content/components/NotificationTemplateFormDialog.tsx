import { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import { useCreateNotificationTemplate, useUpdateNotificationTemplate } from '../hooks/useContent'
import { extractErrorMessage } from '../../../shared/lib/api-client'
import type { NotificationChannel, NotificationTemplate } from '../types'

interface NotificationTemplateFormDialogProps {
  open: boolean
  template: NotificationTemplate | null
  onClose: () => void
  onNotify: (message: string, severity: 'success' | 'error') => void
}

export function NotificationTemplateFormDialog({ open, template, onClose, onNotify }: NotificationTemplateFormDialogProps) {
  const createMutation = useCreateNotificationTemplate()
  const updateMutation = useUpdateNotificationTemplate()
  const isEdit = template !== null

  const [key, setKey] = useState('')
  const [channel, setChannel] = useState<NotificationChannel>('email')
  const [locale, setLocale] = useState('en')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (!open) return
    setKey(template?.key ?? '')
    setChannel(template?.channel ?? 'email')
    setLocale(template?.locale ?? 'en')
    setSubject(template?.subject ?? '')
    setBody(template?.body ?? '')
    setIsActive(template?.is_active ?? true)
  }, [open, template])

  const handleSave = async () => {
    if (!isEdit && (!key.trim() || !/^[a-z0-9_.]+$/.test(key))) {
      onNotify('Key is required and must be lowercase letters, numbers, dots, and underscores.', 'error')
      return
    }
    if (!body.trim()) {
      onNotify('Body is required.', 'error')
      return
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: template.id,
          payload: { subject: subject || null, body, is_active: isActive },
        })
        onNotify('Template updated.', 'success')
      } else {
        await createMutation.mutateAsync({ key, channel, locale, subject: subject || undefined, body })
        onNotify('Template created.', 'success')
      }
      onClose()
    } catch (error) {
      onNotify(extractErrorMessage(error), 'error')
    }
  }

  const pending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? `Edit ${template.key}` : 'New notification template'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Key"
            size="small"
            fullWidth
            value={key}
            onChange={(e) => setKey(e.target.value)}
            disabled={isEdit}
            helperText={isEdit ? 'Keys cannot be changed after creation.' : 'e.g. booking.confirmed'}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Channel"
              size="small"
              fullWidth
              value={channel}
              onChange={(e) => setChannel(e.target.value as NotificationChannel)}
              disabled={isEdit}
            >
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="sms">SMS</MenuItem>
              <MenuItem value="push">Push</MenuItem>
            </TextField>
            <TextField
              label="Locale"
              size="small"
              fullWidth
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              disabled={isEdit}
              slotProps={{ htmlInput: { maxLength: 10 } }}
            />
          </Stack>
          <TextField
            label="Subject (optional)"
            size="small"
            fullWidth
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <TextField
            label="Body"
            size="small"
            fullWidth
            multiline
            minRows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            helperText="Use {{placeholders}} for dynamic values."
          />
          <FormControlLabel
            control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
            label="Active"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={pending}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
