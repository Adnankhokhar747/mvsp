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
import Rating from '@mui/material/Rating'
import {
  useBooking,
  useCancelBooking,
  useSubmitQuote,
  useUpdateBookingStatus,
} from '../hooks/useBookings'
import { BookingStatusChip } from '../components/BookingStatusChip'
import { ErrorState } from '../../../shared/components/ErrorState'
import { extractErrorMessage } from '../../../shared/lib/api-client'
import type { BookingStatusAction } from '../api/bookings-api'

function money(amount: number | null, currency: string) {
  if (amount === null) return 'Awaiting quote'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)
}

const NEXT_ACTION: Partial<Record<string, { action: BookingStatusAction; label: string }>> = {
  pending: { action: 'confirm', label: 'Confirm booking' },
  quoted: { action: 'confirm', label: 'Confirm booking' },
  confirmed: { action: 'start', label: 'Start service' },
  in_progress: { action: 'complete', label: 'Mark completed' },
}

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const bookingId = id ? Number(id) : undefined
  const { data: booking, isLoading, isError, refetch } = useBooking(bookingId)
  const statusMutation = useUpdateBookingStatus()
  const cancelMutation = useCancelBooking()
  const quoteMutation = useSubmitQuote()

  const [cancelling, setCancelling] = useState(false)
  const [reason, setReason] = useState('')
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)
  const [quotePrice, setQuotePrice] = useState('')
  const [quoteDuration, setQuoteDuration] = useState('')
  const [quoteMessage, setQuoteMessage] = useState('')

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
  const nextAction = NEXT_ACTION[booking.status]
  const showQuoteForm = booking.booking_mode === 'request' && booking.status === 'pending'

  const handleTransition = async (action: BookingStatusAction) => {
    if (!bookingId) return
    try {
      await statusMutation.mutateAsync({ bookingId, action })
      setToast({ message: 'Booking updated.', severity: 'success' })
    } catch (error) {
      setToast({ message: extractErrorMessage(error), severity: 'error' })
    }
  }

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

  const handleSubmitQuote = async () => {
    if (!bookingId) return
    const priceNumber = Number(quotePrice)
    if (!quotePrice || Number.isNaN(priceNumber) || priceNumber <= 0) {
      setToast({ message: 'Enter a valid quote amount.', severity: 'error' })
      return
    }
    try {
      await quoteMutation.mutateAsync({
        bookingId,
        payload: {
          quoted_price: Math.round(priceNumber * 100),
          quoted_duration: quoteDuration ? Number(quoteDuration) : undefined,
          message: quoteMessage || undefined,
        },
      })
      setToast({ message: 'Quote sent to the customer.', severity: 'success' })
      setQuotePrice('')
      setQuoteDuration('')
      setQuoteMessage('')
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
                Customer
              </Typography>
              <Typography variant="body2">{booking.customer?.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {booking.customer?.email}
              </Typography>
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

          {booking.address && (
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Service address
              </Typography>
              <Typography variant="body2">
                {booking.address.line1}
                {booking.address.line2 ? `, ${booking.address.line2}` : ''}
              </Typography>
              <Typography variant="body2">
                {[booking.address.city, booking.address.state, booking.address.postal_code].filter(Boolean).join(', ')}
              </Typography>
            </Stack>
          )}

          {booking.notes && (
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Customer notes
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

          {!!booking.quotes.length && (
            <>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="subtitle2">Quote history</Typography>
                {booking.quotes.map((q) => (
                  <Stack key={q.id} direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {money(q.quoted_price, booking.currency_code)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                      {q.status}
                    </Typography>
                    {q.message && (
                      <Typography variant="caption" color="text.secondary">
                        {q.message}
                      </Typography>
                    )}
                  </Stack>
                ))}
              </Stack>
            </>
          )}

          {showQuoteForm && (
            <>
              <Divider />
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">Submit a quote</Typography>
                <TextField
                  label={`Price (${booking.currency_code})`}
                  size="small"
                  type="number"
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(e.target.value)}
                  slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                />
                <TextField
                  label="Estimated duration (minutes, optional)"
                  size="small"
                  type="number"
                  value={quoteDuration}
                  onChange={(e) => setQuoteDuration(e.target.value)}
                  slotProps={{ htmlInput: { min: 1 } }}
                />
                <TextField
                  label="Message to customer (optional)"
                  size="small"
                  multiline
                  minRows={2}
                  value={quoteMessage}
                  onChange={(e) => setQuoteMessage(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleSubmitQuote}
                  disabled={quoteMutation.isPending}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Send quote
                </Button>
              </Stack>
            </>
          )}

          {booking.review && (
            <>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="subtitle2">Customer review</Typography>
                <Rating value={booking.review.rating} readOnly size="small" />
                {booking.review.title && (
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {booking.review.title}
                  </Typography>
                )}
                {booking.review.comment && <Typography variant="body2">{booking.review.comment}</Typography>}
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

          {(nextAction || cancellable) && (
            <>
              <Divider />
              {!cancelling ? (
                <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
                  {nextAction && (
                    <Button
                      variant="contained"
                      onClick={() => handleTransition(nextAction.action)}
                      disabled={statusMutation.isPending}
                    >
                      {nextAction.label}
                    </Button>
                  )}
                  {cancellable && (
                    <Button color="error" onClick={() => setCancelling(true)}>
                      Cancel this booking
                    </Button>
                  )}
                </Stack>
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
