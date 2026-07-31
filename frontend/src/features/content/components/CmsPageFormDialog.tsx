import { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import { useCreateCmsPage, useUpdateCmsPage } from '../hooks/useContent'
import { extractErrorMessage } from '../../../shared/lib/api-client'
import type { CmsPage } from '../types'

interface CmsPageFormDialogProps {
  open: boolean
  page: CmsPage | null
  onClose: () => void
  onNotify: (message: string, severity: 'success' | 'error') => void
}

export function CmsPageFormDialog({ open, page, onClose, onNotify }: CmsPageFormDialogProps) {
  const createMutation = useCreateCmsPage()
  const updateMutation = useUpdateCmsPage()
  const isEdit = page !== null

  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [locale, setLocale] = useState('en')
  const [isPublished, setIsPublished] = useState(false)

  useEffect(() => {
    if (!open) return
    setSlug(page?.slug ?? '')
    setTitle(page?.title ?? '')
    setContent(page?.content ?? '')
    setLocale(page?.locale ?? 'en')
    setIsPublished(page?.is_published ?? false)
  }, [open, page])

  const handleSave = async () => {
    if (!slug.trim() || !title.trim()) {
      onNotify('Slug and title are required.', 'error')
      return
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      onNotify('Slug must be lowercase letters, numbers, and hyphens only.', 'error')
      return
    }

    const payload = { slug, title, content: content || null, locale, is_published: isPublished }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: page.id, payload })
        onNotify('Page updated.', 'success')
      } else {
        await createMutation.mutateAsync(payload)
        onNotify('Page created.', 'success')
      }
      onClose()
    } catch (error) {
      onNotify(extractErrorMessage(error), 'error')
    }
  }

  const pending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? `Edit ${page.title}` : 'New page'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Slug"
              size="small"
              fullWidth
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              helperText="e.g. about-us"
            />
            <TextField
              label="Locale"
              size="small"
              fullWidth
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 10 } }}
            />
          </Stack>
          <TextField label="Title" size="small" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextField
            label="Content (HTML)"
            size="small"
            fullWidth
            multiline
            minRows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: 13 } } }}
          />
          <FormControlLabel
            control={<Switch checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />}
            label="Published"
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
