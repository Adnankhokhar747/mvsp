import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import type { ServicePackage } from '../types'
import type { ServicePackagePayload } from '../api/services-api'

function money(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)
}

interface PackagesEditorProps {
  packages: ServicePackage[]
  currencyCode: string
  onCreate: (payload: ServicePackagePayload) => Promise<void>
  onDelete: (packageId: number) => Promise<void>
}

export function PackagesEditor({ packages, currencyCode, onCreate, onDelete }: PackagesEditorProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleAdd = async () => {
    setError(null)
    const priceNumber = Number(price)
    if (!name.trim() || !price || Number.isNaN(priceNumber) || priceNumber < 0) {
      setError('Enter a name and a valid price.')
      return
    }
    setSaving(true)
    try {
      await onCreate({
        name: name.trim(),
        price: Math.round(priceNumber * 100),
        duration_minutes: durationMinutes ? Number(durationMinutes) : undefined,
        description: description || undefined,
      })
      setName('')
      setPrice('')
      setDurationMinutes('')
      setDescription('')
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (packageId: number) => {
    setError(null)
    setDeletingId(packageId)
    try {
      await onDelete(packageId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}

      {!packages.length && !showForm && (
        <Typography variant="body2" color="text.secondary">
          No packages yet. Offer tiered pricing (e.g. Basic/Standard/Premium) for this service.
        </Typography>
      )}

      {packages.map((pkg) => (
        <Paper key={pkg.id} variant="outlined" sx={{ p: 2 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Stack>
              <Typography sx={{ fontWeight: 600 }}>{pkg.name}</Typography>
              {pkg.description && (
                <Typography variant="caption" color="text.secondary">
                  {pkg.description}
                </Typography>
              )}
              {pkg.duration_minutes && (
                <Typography variant="caption" color="text.secondary">
                  Approx. {pkg.duration_minutes} minutes
                </Typography>
              )}
            </Stack>
            <Stack spacing={1} sx={{ alignItems: 'flex-end' }}>
              <Typography sx={{ fontWeight: 600 }}>{money(pkg.price, currencyCode)}</Typography>
              <Button
                size="small"
                color="error"
                onClick={() => handleDelete(pkg.id)}
                disabled={deletingId === pkg.id}
              >
                Remove
              </Button>
            </Stack>
          </Stack>
        </Paper>
      ))}

      {showForm ? (
        <Stack spacing={1.5} sx={{ maxWidth: 420 }}>
          <Divider />
          <Typography variant="subtitle2">Add a package</Typography>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField
            label={`Price (${currencyCode})`}
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            fullWidth
          />
          <TextField
            label="Duration (minutes, optional)"
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            slotProps={{ htmlInput: { min: 1 } }}
            fullWidth
          />
          <TextField
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={handleAdd} disabled={saving}>
              Save
            </Button>
            <Button onClick={() => setShowForm(false)}>Cancel</Button>
          </Stack>
        </Stack>
      ) : (
        <Button variant="outlined" onClick={() => setShowForm(true)} sx={{ alignSelf: 'flex-start' }}>
          Add package
        </Button>
      )}
    </Stack>
  )
}
