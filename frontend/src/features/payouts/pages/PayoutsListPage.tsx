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
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { usePayouts } from '../hooks/usePayouts'
import { PayoutStatusChip } from '../components/PayoutStatusChip'
import { PayoutDetailDialog } from '../components/PayoutDetailDialog'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import type { PayoutStatus } from '../types'

const STATUS_OPTIONS: Array<{ label: string; value: PayoutStatus | 'all' }> = [
  { label: 'All statuses', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Rejected', value: 'rejected' },
]

function money(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)
}

export function PayoutsListPage() {
  const [status, setStatus] = useState<PayoutStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  const { data, isLoading, isError, refetch } = usePayouts({ page, status })
  const selected = data?.data.find((p) => p.id === selectedId) ?? null

  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4" fontWeight={700}>
          Payouts
        </Typography>
        <Typography color="text.secondary">Review and process vendor payout requests.</Typography>
      </Stack>

      <TextField
        select
        size="small"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value as PayoutStatus | 'all')
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

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        {isError ? (
          <ErrorState message="Couldn't load payouts." onRetry={() => refetch()} />
        ) : !isLoading && data?.data.length === 0 ? (
          <EmptyState title="No payout requests found" description="Try a different filter." />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Requested</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : data?.data.map((payout) => (
                      <TableRow key={payout.id} hover sx={{ cursor: 'pointer' }} onClick={() => setSelectedId(payout.id)}>
                        <TableCell>
                          <Typography fontWeight={600}>{payout.vendor?.business_name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{money(payout.amount, payout.currency_code)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {payout.method.replace('_', ' ')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{new Date(payout.requested_at).toLocaleDateString()}</Typography>
                        </TableCell>
                        <TableCell>
                          <PayoutStatusChip status={payout.status} />
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

      <PayoutDetailDialog
        payout={selected}
        onClose={() => setSelectedId(null)}
        onNotify={(message, severity) => setToast({ message, severity })}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast && <Alert severity={toast.severity}>{toast.message}</Alert>}
      </Snackbar>
    </Stack>
  )
}
