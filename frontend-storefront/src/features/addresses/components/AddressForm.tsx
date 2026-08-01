import { useState } from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import type { AddressPayload } from '../api/addresses-api'

interface AddressFormProps {
  onSave: (payload: AddressPayload) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

export function AddressForm({ onSave, onCancel, submitLabel = 'Save address' }: AddressFormProps) {
  const [label, setLabel] = useState('')
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    if (!line1.trim() || !city.trim() || countryCode.trim().length !== 2) {
      setError('Street address, city, and a 2-letter country code are required.')
      return
    }
    setSaving(true)
    try {
      await onSave({
        label: label || undefined,
        line1: line1.trim(),
        line2: line2 || undefined,
        city: city.trim(),
        state: state || undefined,
        country_code: countryCode.trim().toUpperCase(),
        postal_code: postalCode || undefined,
        is_default: isDefault,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField label="Label (optional)" placeholder="Home, Office…" value={label} onChange={(e) => setLabel(e.target.value)} fullWidth />
      <TextField label="Street address" value={line1} onChange={(e) => setLine1(e.target.value)} fullWidth />
      <TextField label="Apartment, suite, etc. (optional)" value={line2} onChange={(e) => setLine2(e.target.value)} fullWidth />
      <Stack direction="row" spacing={2}>
        <TextField label="City" value={city} onChange={(e) => setCity(e.target.value)} fullWidth />
        <TextField label="State/Province (optional)" value={state} onChange={(e) => setState(e.target.value)} fullWidth />
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField
          label="Country code (e.g. US)"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          slotProps={{ htmlInput: { maxLength: 2 } }}
          fullWidth
        />
        <TextField label="Postal code (optional)" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} fullWidth />
      </Stack>
      <FormControlLabel
        control={<Checkbox checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />}
        label="Set as default address"
      />
      <Stack direction="row" spacing={1}>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {submitLabel}
        </Button>
        {onCancel && <Button onClick={onCancel}>Cancel</Button>}
      </Stack>
    </Stack>
  )
}
