import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { useAcceptQuote, useBooking, useCancelBooking, useRejectQuote } from '../hooks/useBookings'
import { BookingStatusChip } from '../components/BookingStatusChip'
import { ErrorState } from '../../../shared/components/ErrorState'
import { extractErrorMessage } from '../../../shared/lib/api-client'

function money(amount: number | null, currency: string) {
  if (amount === null) return 'Awaiting quote'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)
}

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const bookingId = id ? Number(id) : undefined
  const { data: booking, isLoading, isError, refetch } = useBooking(bookingId)
  const cancelMutation = useCancelBooking()
  const acceptMutation = useAcceptQuote()
  const rejectMutation = useRejectQuote()

  const [cancelling, setCancelling] = useState(false)
  const [reason, setReason] = useState('')
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  if (isError) {
    return <ErrorState message="Couldn't load this booking." onRetry={() => refetch()} />
  }

  if (isLoading || !booking) {
    return (
      <Stack spacing={2}>
        <Skeleton width="40%" height={40} />
        <Skeleton variant="rounded" height={240} />
      </Stack>
    )
  }

  const cancellable = ['pending', 'quoted', 'confirmed'].includes(booking.status)
  const pendingQuote = booking.quotes.find((q) => q.status === 'pending')

  const handleCancel = async () => {
    if (!bookingId) return
    try {
      await cancelMutation.mutateAsync({ id: bookingId, reason: reason || undefined })
      setToast({ message: 'Booking cancelled.', severity: 'success' })
      setCancelling(false)
    } catch (error) {
      setToast({ message: extractErrorMessage(error), severity: 'error' })
    }
  }

  const handleAcceptQuote = async () => {
    if (!bookingId) return
    try {
      await acceptMutation.mutateAsync(bookingId)
      setToast({ message: 'Quote accepted — booking confirmed.', severity: 'success' })
    } catch (error) {
      setToast({ message: extractErrorMessage(error), severity: 'error' })
    }
  }

  const handleRejectQuote = async () => {
    if (!bookingId) return
    try {
      await rejectMutation.mutateAsync(bookingId)
      setToast({ message: 'Quote rejected.', severity: 'success' })
    } catch (error) {
      setToast({ message: extractErrorMessage(error), severity: 'error' })
    }
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 640 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {booking.booking_number}
          </Typography>
          <Typography color="text.secondary">{booking.service?.title}</Typography>
        </Stack>
        <BookingStatusChip status={booking.status} />
      </Stack>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={4}>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Vendor
              </Typography>
              <Typography variant="body2">{booking.vendor?.business_name}</Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Scheduled
              </Typography>
              <Typography variant="body2">
                {booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleString() : 'Not scheduled (quote request)'}
              </Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Price
              </Typography>
              <Typography variant="body2">{money(booking.price, booking.currency_code)}</Typography>
            </Stack>
          </Stack>

          {booking.notes && (
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Notes
              </Typography>
              <Typography variant="body2">{booking.notes}</Typography>
            </Stack>
          )}

          {booking.cancellation_reason && (
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Cancellation reason
              </Typography>
              <Typography variant="body2">{booking.cancellation_reason}</Typography>
            </Stack>
          )}

          {pendingQuote && (
            <>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="subtitle2">Vendor's quote</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {money(pendingQuote.quoted_price, booking.currency_code)}
                </Typography>
                {pendingQuote.message && <Typography variant="body2">{pendingQuote.message}</Typography>}
                {pendingQuote.expires_at && (
                  <Typography variant="caption" color="text.secondary">
                    Expires {new Date(pendingQuote.expires_at).toLocaleString()}
                  </Typography>
                )}
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    onClick={handleAcceptQuote}
                    disabled={acceptMutation.isPending}
                  >
                    Accept quote
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleRejectQuote}
                    disabled={rejectMutation.isPending}
                  >
                    Reject quote
                  </Button>
                </Stack>
              </Stack>
            </>
          )}

          {!!booking.status_history?.length && (
            <>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="subtitle2">History</Typography>
                {booking.status_history.map((entry, i) => (
                  <Stack key={i} direction="row" spacing={1}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 140 }}>
                      {new Date(entry.created_at).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      {entry.from_status ? `${entry.from_status} → ${entry.to_status}` : entry.to_status}
                      {entry.note ? ` — ${entry.note}` : ''}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </>
          )}

          {cancellable && (
            <>
              <Divider />
              {!cancelling ? (
                <Button color="error" onClick={() => setCancelling(true)} sx={{ alignSelf: 'flex-start' }}>
                  Cancel this booking
                </Button>
              ) : (
                <Stack spacing={1.5}>
                  <TextField
                    label="Reason (optional)"
                    size="small"
                    fullWidth
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleCancel}
                      disabled={cancelMutation.isPending}
                    >
                      Confirm cancellation
                    </Button>
                    <Button onClick={() => setCancelling(false)}>Back</Button>
                  </Stack>
                </Stack>
              )}
            </>
          )}
        </Stack>
      </Paper>

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
