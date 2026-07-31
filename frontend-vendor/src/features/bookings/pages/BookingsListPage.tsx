import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Pagination from '@mui/material/Pagination'
import { useBookings } from '../hooks/useBookings'
import { BookingStatusChip } from '../components/BookingStatusChip'
import { ErrorState } from '../../../shared/components/ErrorState'
import { EmptyState } from '../../../shared/components/EmptyState'
import type { BookingStatus } from '../types'

const STATUS_OPTIONS: Array<{ label: string; value: BookingStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Quoted', value: 'quoted' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

function money(amount: number | null, currency: string) {
  if (amount === null) return 'Awaiting quote'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)
}

export function BookingsListPage() {
  const [status, setStatus] = useState<BookingStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useBookings({ page, status })

  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Bookings
        </Typography>
        <Typography color="text.secondary">Manage incoming bookings, quotes, and status.</Typography>
      </Stack>

      <TextField
        select
        size="small"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value as BookingStatus | 'all')
          setPage(1)
        }}
        sx={{ minWidth: 180 }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>

      <Paper variant="outlined">
        {isError ? (
          <ErrorState message="Couldn't load bookings." onRetry={() => refetch()} />
        ) : !isLoading && data?.data.length === 0 ? (
          <EmptyState title="No bookings" description="Bookings assigned to you will show up here." />
        ) : (
          <List disablePadding>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Stack key={i} sx={{ p: 2 }}>
                    <Skeleton width="60%" />
                    <Skeleton width="40%" />
                  </Stack>
                ))
              : data?.data.map((booking) => {
                  const needsQuote = booking.booking_mode === 'request' && booking.status === 'pending'
                  return (
                    <ListItemButton
                      key={booking.id}
                      component={RouterLink}
                      to={`/bookings/${booking.id}`}
                      divider
                      sx={{ py: 2 }}
                    >
                      <ListItemText
                        slotProps={{ primary: { component: 'div' }, secondary: { component: 'div' } }}
                        primary={
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Typography sx={{ fontWeight: 600 }}>{booking.service?.title}</Typography>
                            <BookingStatusChip status={booking.status} />
                            {needsQuote && <Chip size="small" label="Needs quote" color="warning" />}
                          </Stack>
                        }
                        secondary={
                          <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              {booking.customer?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleString() : 'Not scheduled'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {money(booking.price, booking.currency_code)}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItemButton>
                  )
                })}
          </List>
        )}

        {data && data.meta.last_page > 1 && (
          <Stack sx={{ alignItems: 'center', py: 2 }}>
            <Pagination count={data.meta.last_page} page={data.meta.current_page} onChange={(_, v) => setPage(v)} />
          </Stack>
        )}
      </Paper>
    </Stack>
  )
}
