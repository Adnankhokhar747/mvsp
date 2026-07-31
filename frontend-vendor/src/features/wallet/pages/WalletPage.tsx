import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import { useBankAccounts, useLedger, useRequestPayout, useWallet } from '../hooks/useWallet'
import { BankAccountsPanel } from '../components/BankAccountsPanel'
import { RequestPayoutDialog } from '../components/RequestPayoutDialog'
import { LedgerEntryTypeChip } from '../components/LedgerEntryTypeChip'
import { ErrorState } from '../../../shared/components/ErrorState'
import { EmptyState } from '../../../shared/components/EmptyState'
import { extractErrorMessage } from '../../../shared/lib/api-client'

function money(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)
}

export function WalletPage() {
  const { data: wallet, isLoading, isError, refetch } = useWallet()
  const { data: bankAccounts } = useBankAccounts()
  const [page, setPage] = useState(1)
  const { data: ledger, isLoading: ledgerLoading } = useLedger(page)
  const requestPayoutMutation = useRequestPayout()

  const [payoutOpen, setPayoutOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton width="40%" height={40} />
        <Skeleton variant="rounded" height={140} />
      </Stack>
    )
  }

  if (isError || !wallet) {
    return <ErrorState message="Couldn't load your wallet." onRetry={() => refetch()} />
  }

  const handleRequestPayout = async (amount: number, bankAccountId: number | null) => {
    try {
      await requestPayoutMutation.mutateAsync({ amount, bankAccountId })
      setToast({ message: 'Payout requested — funds are now on hold pending review.', severity: 'success' })
      setPayoutOpen(false)
    } catch (error) {
      setToast({ message: extractErrorMessage(error), severity: 'error' })
    }
  }

  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Wallet
        </Typography>
        <Typography color="text.secondary">Track your earnings and request payouts.</Typography>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack direction="row" spacing={4} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Stack>
            <Typography variant="caption" color="text.secondary">
              Available balance
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {money(wallet.balance, wallet.currency_code)}
            </Typography>
          </Stack>
          <Stack>
            <Typography variant="caption" color="text.secondary">
              Held (pending payouts)
            </Typography>
            <Typography variant="h6">{money(wallet.held_balance, wallet.currency_code)}</Typography>
          </Stack>
          <Button
            variant="contained"
            size="large"
            onClick={() => setPayoutOpen(true)}
            disabled={wallet.balance <= 0}
            sx={{ ml: 'auto' }}
          >
            Request payout
          </Button>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Bank accounts
          </Typography>
          <BankAccountsPanel />
        </Stack>
      </Paper>

      <Paper variant="outlined">
        <Stack sx={{ p: 3, pb: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Transaction history
          </Typography>
        </Stack>
        {!ledgerLoading && ledger?.data.length === 0 ? (
          <EmptyState title="No transactions yet" />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Balance after</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ledgerLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : ledger?.data.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <LedgerEntryTypeChip type={entry.type} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{entry.description ?? '—'}</Typography>
                        </TableCell>
                        <TableCell align="right">{money(entry.amount, wallet.currency_code)}</TableCell>
                        <TableCell align="right">{money(entry.balance_after, wallet.currency_code)}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(entry.created_at).toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {ledger && ledger.meta.last_page > 1 && (
          <>
            <Divider />
            <TablePagination
              component="div"
              count={ledger.meta.total}
              page={ledger.meta.current_page - 1}
              rowsPerPage={ledger.meta.per_page}
              rowsPerPageOptions={[ledger.meta.per_page]}
              onPageChange={(_, newPage) => setPage(newPage + 1)}
            />
          </>
        )}
      </Paper>

      <RequestPayoutDialog
        open={payoutOpen}
        onClose={() => setPayoutOpen(false)}
        onConfirm={handleRequestPayout}
        availableBalance={wallet.balance}
        currencyCode={wallet.currency_code}
        bankAccounts={bankAccounts ?? []}
        isSubmitting={requestPayoutMutation.isPending}
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
