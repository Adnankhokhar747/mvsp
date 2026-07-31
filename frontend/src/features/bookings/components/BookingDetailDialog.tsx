import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { useBooking, useCancelBooking } from '../hooks/useBookings'
import { BookingStatusChip } from './BookingStatusChip'
import { extractErrorMessage } from '../../../shared/lib/api-client'

function money(amount: number | null, currency: string) {
  if (amount === null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)
}

interface BookingDetailDialogProps {
  bookingId: number | null
  onClose: () => void
  onNotify: (message: string, severity: 'success' | 'error') => void
  canCancel: boolean
}

export function BookingDetailDialog({ bookingId, onClose, onNotify, canCancel }: BookingDetailDialogProps) {
  const { data: booking, isLoading } = useBooking(bookingId)
  const cancelMutation = useCancelBooking()
  const [reason, setReason] = useState('')
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  const handleCancel = async () => {
    if (!booking) return
    try {
      await cancelMutation.mutateAsync({ id: booking.id, reason: reason || undefined })
      onNotify('Booking cancelled.', 'success')
      setConfirmingCancel(false)
      setReason('')
    } catch (error) {
      onNotify(extractErrorMessage(error), 'error')
    }
  }

  const cancellable = booking && ['pending', 'quoted', 'confirmed'].includes(booking.status)

  return (
    <Dialog open={bookingId !== null} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Booking details</DialogTitle>
      <DialogContent>
        {isLoading || !booking ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {booking.booking_number}
              </Typography>
              <BookingStatusChip status={booking.status} />
            </Stack>

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
                  Vendor
                </Typography>
                <Typography variant="body2">{booking.vendor?.business_name}</Typography>
              </Stack>
            </Stack>

            <Stack>
              <Typography variant="caption" color="text.secondary">
                Service
              </Typography>
              <Typography variant="body2">{booking.service?.title}</Typography>
            </Stack>

            <Stack direction="row" spacing={4}>
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  Scheduled
                </Typography>
                <Typography variant="body2">
                  {booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleString() : 'Not scheduled (request mode)'}
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

            {!!booking.status_history?.length && (
              <>
                <Divider />
                <Stack>
                  <Typography variant="subtitle2" gutterBottom>
                    History
                  </Typography>
                  <Stack spacing={1}>
                    {booking.status_history.map((entry, i) => (
                      <Stack key={i} direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
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
                </Stack>
              </>
            )}

            {canCancel && cancellable && (
              <>
                <Divider />
                {confirmingCancel ? (
                  <Stack spacing={1.5}>
                    <TextField
                      label="Cancellation reason (optional)"
                      size="small"
                      fullWidth
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={handleCancel}
                        disabled={cancelMutation.isPending}
                      >
                        Confirm cancellation
                      </Button>
                      <Button size="small" onClick={() => setConfirmingCancel(false)}>
                        Back
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Button size="small" color="error" onClick={() => setConfirmingCancel(true)} sx={{ alignSelf: 'flex-start' }}>
                    Cancel this booking
                  </Button>
                )}
              </>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
