import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import { useService } from '../../services/hooks/useServices'
import { useAvailability, useCreateBooking } from '../hooks/useBookings'
import { useAddresses } from '../../addresses/hooks/useAddresses'
import { extractErrorMessage } from '../../../shared/lib/api-client'

function today(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

export function BookingCreatePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const serviceId = id ? Number(id) : undefined
  const { data: service, isLoading: serviceLoading } = useService(serviceId)
  const createMutation = useCreateBooking()

  const { data: addresses } = useAddresses()
  const [date, setDate] = useState(today(1))
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [addressId, setAddressId] = useState<number | ''>('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (addresses?.length && addressId === '') {
      setAddressId(addresses.find((a) => a.is_default)?.id ?? addresses[0].id)
    }
  }, [addresses, addressId])

  const isQuoteMode = service?.price_type === 'quote'

  const { data: slots, isLoading: slotsLoading } = useAvailability(
    !isQuoteMode ? serviceId : undefined,
    date,
    date,
  )

  const slotButtons = useMemo(
    () =>
      (slots ?? []).map((slot) => ({
        value: slot.start,
        label: new Date(slot.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      })),
    [slots],
  )

  const handleSubmit = async () => {
    setError(null)
    if (!serviceId) return
    if (!isQuoteMode && !selectedSlot) {
      setError('Choose an available time slot.')
      return
    }

    try {
      const booking = await createMutation.mutateAsync({
        service_id: serviceId,
        scheduled_at: selectedSlot ?? undefined,
        address_id: addressId === '' ? undefined : addressId,
        notes: notes || undefined,
      })
      navigate(`/bookings/${booking.id}`)
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  if (serviceLoading || !service) {
    return (
      <Stack spacing={2}>
        <Skeleton width="40%" height={40} />
        <Skeleton variant="rounded" height={200} />
      </Stack>
    )
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 560 }}>
      <Stack>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {isQuoteMode ? 'Request a quote' : 'Book this service'}
        </Typography>
        <Typography color="text.secondary">{service.title}</Typography>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}

          {isQuoteMode ? (
            <Typography variant="body2" color="text.secondary">
              This vendor prices this service by request. Describe what you need and they'll send you a quote.
            </Typography>
          ) : (
            <>
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                  setSelectedSlot(null)
                }}
                slotProps={{ htmlInput: { min: today(0) } }}
              />

              <Stack spacing={1}>
                <Typography variant="subtitle2">Available times</Typography>
                {slotsLoading ? (
                  <Skeleton variant="rounded" height={40} />
                ) : slotButtons.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No open slots on this date — try another day.
                  </Typography>
                ) : (
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {slotButtons.map((slot) => (
                      <Chip
                        key={slot.value}
                        label={slot.label}
                        color={selectedSlot === slot.value ? 'primary' : 'default'}
                        variant={selectedSlot === slot.value ? 'filled' : 'outlined'}
                        onClick={() => setSelectedSlot(slot.value)}
                        clickable
                      />
                    ))}
                  </Stack>
                )}
              </Stack>
            </>
          )}

          <Stack spacing={0.5}>
            <TextField
              select
              label="Service address (optional)"
              value={addressId}
              onChange={(e) => setAddressId(e.target.value === '' ? '' : Number(e.target.value))}
              fullWidth
            >
              <MenuItem value="">No address</MenuItem>
              {addresses?.map((address) => (
                <MenuItem key={address.id} value={address.id}>
                  {address.label ? `${address.label} — ` : ''}
                  {address.line1}, {address.city}
                </MenuItem>
              ))}
            </TextField>
            <Link component={RouterLink} to="/account/addresses" variant="caption">
              Manage addresses
            </Link>
          </Stack>

          <TextField
            label={isQuoteMode ? 'Describe what you need' : 'Notes for the vendor (optional)'}
            multiline
            minRows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending
              ? 'Submitting…'
              : isQuoteMode
                ? 'Request quote'
                : 'Confirm booking'}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  )
}
