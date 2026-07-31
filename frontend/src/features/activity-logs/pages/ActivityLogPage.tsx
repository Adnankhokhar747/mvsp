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
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import { useActivityLogs } from '../hooks/useActivityLogs'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import type { ActivityEvent } from '../types'

const SUBJECT_TYPE_OPTIONS = [
  { label: 'All subjects', value: 'all' },
  { label: 'Vendor', value: 'Vendor' },
  { label: 'Service', value: 'Service' },
  { label: 'Booking', value: 'Booking' },
  { label: 'Transaction', value: 'Transaction' },
  { label: 'Payout request', value: 'PayoutRequest' },
  { label: 'Vendor subscription', value: 'VendorSubscription' },
]

const EVENT_OPTIONS: Array<{ label: string; value: ActivityEvent | 'all' }> = [
  { label: 'All events', value: 'all' },
  { label: 'Created', value: 'created' },
  { label: 'Updated', value: 'updated' },
  { label: 'Deleted', value: 'deleted' },
]

const EVENT_COLOR: Record<string, 'success' | 'info' | 'error' | 'default'> = {
  created: 'success',
  updated: 'info',
  deleted: 'error',
}

export function ActivityLogPage() {
  const [subjectType, setSubjectType] = useState<string>('all')
  const [event, setEvent] = useState<ActivityEvent | 'all'>('all')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useActivityLogs({ page, subjectType, event })

  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4" fontWeight={700}>
          Activity Log
        </Typography>
        <Typography color="text.secondary">
          An audit trail of who changed what across the platform's core records.
        </Typography>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          select
          size="small"
          label="Subject"
          value={subjectType}
          onChange={(e) => {
            setSubjectType(e.target.value)
            setPage(1)
          }}
          sx={{ minWidth: 200 }}
        >
          {SUBJECT_TYPE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Event"
          value={event}
          onChange={(e) => {
            setEvent(e.target.value as ActivityEvent | 'all')
            setPage(1)
          }}
          sx={{ minWidth: 160 }}
        >
          {EVENT_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        {isError ? (
          <ErrorState message="Couldn't load the activity log." onRetry={() => refetch()} />
        ) : !isLoading && data?.data.length === 0 ? (
          <EmptyState title="No activity found" description="Try a different filter." />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Causer</TableCell>
                  <TableCell>When</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 4 }).map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : data?.data.map((entry) => (
                      <TableRow key={entry.id} hover>
                        <TableCell>
                          <Chip
                            size="small"
                            label={entry.event}
                            color={EVENT_COLOR[entry.event] ?? 'default'}
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {entry.subject_type ?? 'Unknown'}
                            {entry.subject_id ? ` #${entry.subject_id}` : ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{entry.causer?.name ?? 'System'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{new Date(entry.created_at).toLocaleString()}</Typography>
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
    </Stack>
  )
}
