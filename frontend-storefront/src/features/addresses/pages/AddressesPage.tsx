import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { useAddresses, useCreateAddress, useDeleteAddress } from '../hooks/useAddresses'
import { AddressForm } from '../components/AddressForm'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { extractErrorMessage } from '../../../shared/lib/api-client'
import type { AddressPayload } from '../api/addresses-api'

export function AddressesPage() {
  const { data: addresses, isLoading, isError, refetch } = useAddresses()
  const createMutation = useCreateAddress()
  const deleteMutation = useDeleteAddress()

  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  const handleCreate = async (payload: AddressPayload) => {
    try {
      await createMutation.mutateAsync(payload)
      setShowForm(false)
      setToast({ message: 'Address added.', severity: 'success' })
    } catch (error) {
      throw new Error(extractErrorMessage(error))
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id)
      setToast({ message: 'Address removed.', severity: 'success' })
    } catch (error) {
      setToast({ message: extractErrorMessage(error), severity: 'error' })
    }
  }

  if (isError) {
    return <ErrorState message="Couldn't load your addresses." onRetry={() => refetch()} />
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 560 }}>
      <Stack>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Addresses
        </Typography>
        <Typography color="text.secondary">Manage the addresses you book services at.</Typography>
      </Stack>

      {isLoading ? (
        <Skeleton variant="rounded" height={100} />
      ) : addresses?.length === 0 && !showForm ? (
        <EmptyState title="No addresses yet" description="Add one so it's ready next time you book." />
      ) : (
        <Stack spacing={2}>
          {addresses?.map((address) => (
            <Paper key={address.id} variant="outlined" sx={{ p: 2.5 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Stack>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 600 }}>{address.label || 'Address'}</Typography>
                    {address.is_default && <Chip size="small" label="Default" color="primary" />}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ''}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {[address.city, address.state, address.postal_code].filter(Boolean).join(', ')}
                    {address.country_code ? ` · ${address.country_code}` : ''}
                  </Typography>
                </Stack>
                <Button size="small" color="error" onClick={() => handleDelete(address.id)} disabled={deleteMutation.isPending}>
                  Remove
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {showForm ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <AddressForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
        </Paper>
      ) : (
        <Button variant="outlined" onClick={() => setShowForm(true)} sx={{ alignSelf: 'flex-start' }}>
          Add address
        </Button>
      )}

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast ? <Alert severity={toast.severity}>{toast.message}</Alert> : undefined}
      </Snackbar>
    </Stack>
  )
}
