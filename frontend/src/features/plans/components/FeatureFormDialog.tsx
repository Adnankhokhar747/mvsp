import { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import { useCreatePlanFeature, useUpdatePlanFeature } from '../hooks/usePlans'
import { extractErrorMessage } from '../../../shared/lib/api-client'
import type { PlanFeature, PlanFeatureType } from '../types'

interface FeatureFormDialogProps {
  open: boolean
  feature: PlanFeature | null
  onClose: () => void
  onNotify: (message: string, severity: 'success' | 'error') => void
}

const KEY_PATTERN = /^[a-z0-9_]+$/

export function FeatureFormDialog({ open, feature, onClose, onNotify }: FeatureFormDialogProps) {
  const createMutation = useCreatePlanFeature()
  const updateMutation = useUpdatePlanFeature()
  const isEdit = feature !== null

  const [key, setKey] = useState('')
  const [label, setLabel] = useState('')
  const [type, setType] = useState<PlanFeatureType>('limit')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (open) {
      setKey(feature?.key ?? '')
      setLabel(feature?.label ?? '')
      setType(feature?.type ?? 'limit')
      setDescription(feature?.description ?? '')
    }
  }, [open, feature])

  const handleSave = async () => {
    if (!isEdit && !KEY_PATTERN.test(key)) {
      onNotify('Key must be lowercase letters, numbers, and underscores only.', 'error')
      return
    }
    if (!label.trim()) {
      onNotify('Label is required.', 'error')
      return
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: feature.id,
          payload: { label, description: description || null },
        })
        onNotify('Feature updated.', 'success')
      } else {
        await createMutation.mutateAsync({ key, label, type, description: description || undefined })
        onNotify('Feature created.', 'success')
      }
      onClose()
    } catch (error) {
      onNotify(extractErrorMessage(error), 'error')
    }
  }

  const pending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Edit feature' : 'New plan feature'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Key"
            size="small"
            fullWidth
            value={key}
            onChange={(e) => setKey(e.target.value)}
            disabled={isEdit}
            helperText={isEdit ? 'Keys cannot be changed after creation.' : 'Lowercase letters, numbers, underscores. e.g. max_services'}
          />
          <TextField label="Label" size="small" fullWidth value={label} onChange={(e) => setLabel(e.target.value)} />
          <TextField
            select
            label="Type"
            size="small"
            fullWidth
            value={type}
            onChange={(e) => setType(e.target.value as PlanFeatureType)}
            disabled={isEdit}
            helperText={isEdit ? undefined : 'Limit: a number, 0 = unlimited. Boolean: on/off.'}
          >
            <MenuItem value="limit">Limit</MenuItem>
            <MenuItem value="boolean">Boolean</MenuItem>
          </TextField>
          <TextField
            label="Description (optional)"
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
