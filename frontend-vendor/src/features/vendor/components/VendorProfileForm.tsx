import { useState } from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import type { Vendor } from '../types'
import type { VendorProfilePayload } from '../api/vendor-api'

interface VendorProfileFormProps {
  vendor: Vendor
  onSave: (payload: VendorProfilePayload) => Promise<void>
}

export function VendorProfileForm({ vendor, onSave }: VendorProfileFormProps) {
  const [values, setValues] = useState({
    business_name: vendor.business_name,
    description: vendor.description ?? '',
    email: vendor.email ?? '',
    phone: vendor.phone ?? '',
    whatsapp: vendor.whatsapp ?? '',
    currency_code: vendor.currency_code,
    timezone: vendor.timezone,
  })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const setField = (key: keyof typeof values, value: string) => setValues((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    setError(null)
    if (!values.business_name.trim()) {
      setError('Business name is required.')
      return
    }
    setSaving(true)
    try {
      await onSave(values)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 480 }}>
      {vendor.status === 'rejected' && vendor.rejection_reason && (
        <Alert severity="error">Rejected: {vendor.rejection_reason}</Alert>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Business name"
        value={values.business_name}
        onChange={(e) => setField('business_name', e.target.value)}
        fullWidth
      />
      <TextField
        label="Description"
        value={values.description}
        onChange={(e) => setField('description', e.target.value)}
        multiline
        minRows={3}
        fullWidth
      />
      <TextField label="Email" value={values.email} onChange={(e) => setField('email', e.target.value)} fullWidth />
      <TextField label="Phone" value={values.phone} onChange={(e) => setField('phone', e.target.value)} fullWidth />
      <TextField
        label="WhatsApp"
        value={values.whatsapp}
        onChange={(e) => setField('whatsapp', e.target.value)}
        fullWidth
      />
      <TextField
        label="Currency code"
        value={values.currency_code}
        onChange={(e) => setField('currency_code', e.target.value.toUpperCase())}
        slotProps={{ htmlInput: { maxLength: 3 } }}
        fullWidth
      />
      <TextField
        label="Timezone"
        value={values.timezone}
        onChange={(e) => setField('timezone', e.target.value)}
        fullWidth
      />

      <Button variant="contained" onClick={handleSubmit} disabled={saving} sx={{ alignSelf: 'flex-start' }}>
        Save profile
      </Button>
    </Stack>
  )
}
