import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import MenuItem from '@mui/material/MenuItem'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { useBookings } from '../hooks/useBookings'
import { BookingStatusChip } from '../components/BookingStatusChip'
import { BookingDetailDialog } from '../components/BookingDetailDialog'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import type { BookingStatus } from '../types'

const STATUS_OPTIONS: Array<{ label: string; value: BookingStatus | 'all' }> = [
  { label: 'All statuses', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Quoted', value: 'quoted' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Disputed', value: 'disputed' },
  { label: 'Refunded', value: 'refunded' },
]

function money(amount: number | null, currency: string) {
  if (amount === null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)
}

export function BookingsListPage() {
  const [status, setStatus] = useState<BookingStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  const { data, isLoading, isError, refetch } = useBookings({ page, status, search })

  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Bookings
        </Typography>
        <Typography color="text.secondary">All bookings across every vendor on the platform.</Typography>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
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

        <TextField
          size="small"
          placeholder="Search by booking number…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          sx={{ minWidth: 260 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        {isError ? (
          <ErrorState message="Couldn't load bookings." onRetry={() => refetch()} />
        ) : !isLoading && data?.data.length === 0 ? (
          <EmptyState title="No bookings found" description="Try a different filter or search term." />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Booking</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Scheduled</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : data?.data.map((booking) => (
                      <TableRow key={booking.id} hover sx={{ cursor: 'pointer' }} onClick={() => setSelectedId(booking.id)}>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600 }}>{booking.booking_number}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {booking.service?.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{booking.customer?.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{booking.vendor?.business_name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleDateString() : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{money(booking.price, booking.currency_code)}</Typography>
                        </TableCell>
                        <TableCell>
                          <BookingStatusChip status={booking.status} />
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {data && (
          <TablePagination
            component="div"
            count={data.meta.total}
            page={data.meta.current_page - 1}
            rowsPerPage={data.meta.per_page}
            rowsPerPageOptions={[data.meta.per_page]}
            onPageChange={(_, newPage) => setPage(newPage + 1)}
          />
        )}
      </Paper>

      <BookingDetailDialog
        bookingId={selectedId}
        onClose={() => setSelectedId(null)}
        onNotify={(message, severity) => setToast({ message, severity })}
        canCancel
      />

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
