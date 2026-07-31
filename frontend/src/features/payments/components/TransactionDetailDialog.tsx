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
import { useConfirmTransaction, useRefundTransaction, useTransaction } from '../hooks/usePayments'
import { TransactionStatusChip } from './TransactionStatusChip'
import { extractErrorMessage } from '../../../shared/lib/api-client'

function money(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)
}

interface TransactionDetailDialogProps {
  transactionId: number | null
  onClose: () => void
  onNotify: (message: string, severity: 'success' | 'error') => void
}

export function TransactionDetailDialog({ transactionId, onClose, onNotify }: TransactionDetailDialogProps) {
  const { data: transaction, isLoading } = useTransaction(transactionId)
  const confirmMutation = useConfirmTransaction()
  const refundMutation = useRefundTransaction()
  const [refunding, setRefunding] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')

  const remaining = transaction ? transaction.amount - (transaction.refunded_amount ?? 0) : 0
  const refundable = transaction?.status === 'success' && remaining > 0
  const confirmable = transaction?.status === 'pending'

  const openRefundForm = () => {
    setRefundAmount((remaining / 100).toString())
    setRefunding(true)
  }

  const handleConfirm = async () => {
    if (!transaction) return
    try {
      await confirmMutation.mutateAsync(transaction.id)
      onNotify('Payment confirmed.', 'success')
    } catch (error) {
      onNotify(extractErrorMessage(error), 'error')
    }
  }

  const handleRefund = async () => {
    if (!transaction) return
    const amountMinorUnits = Math.round(parseFloat(refundAmount) * 100)
    if (!amountMinorUnits || amountMinorUnits < 1 || amountMinorUnits > remaining) {
      onNotify(`Enter an amount between 0.01 and ${(remaining / 100).toFixed(2)}.`, 'error')
      return
    }
    try {
      await refundMutation.mutateAsync({ id: transaction.id, amount: amountMinorUnits, reason: refundReason || undefined })
      onNotify('Refund issued.', 'success')
      setRefunding(false)
      setRefundReason('')
    } catch (error) {
      onNotify(extractErrorMessage(error), 'error')
    }
  }

  return (
    <Dialog
      open={transactionId !== null}
      onClose={() => {
        setRefunding(false)
        onClose()
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Transaction details</DialogTitle>
      <DialogContent>
        {isLoading || !transaction ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {transaction.transaction_number}
              </Typography>
              <TransactionStatusChip status={transaction.status} />
            </Stack>

            <Stack direction="row" spacing={4}>
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  Payer
                </Typography>
                <Typography variant="body2">{transaction.user?.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {transaction.user?.email}
                </Typography>
              </Stack>
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  Vendor
                </Typography>
                <Typography variant="body2">{transaction.vendor?.business_name ?? '—'}</Typography>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={4}>
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  Type
                </Typography>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {transaction.type}
                </Typography>
              </Stack>
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  Gateway
                </Typography>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {transaction.gateway ?? '—'}
                </Typography>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={4}>
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="body2">{money(transaction.amount, transaction.currency_code)}</Typography>
              </Stack>
              {!!transaction.refunded_amount && (
                <Stack>
                  <Typography variant="caption" color="text.secondary">
                    Refunded
                  </Typography>
                  <Typography variant="body2">{money(transaction.refunded_amount, transaction.currency_code)}</Typography>
                </Stack>
              )}
            </Stack>

            {!!transaction.refunds?.length && (
              <>
                <Divider />
                <Stack>
                  <Typography variant="subtitle2" gutterBottom>
                    Refund history
                  </Typography>
                  <Stack spacing={1}>
                    {transaction.refunds.map((refund) => (
                      <Stack key={refund.id} direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 140 }}>
                          {refund.processed_at ? new Date(refund.processed_at).toLocaleString() : '—'}
                        </Typography>
                        <Typography variant="body2">
                          {money(refund.amount, transaction.currency_code)}
                          {refund.reason ? ` — ${refund.reason}` : ''}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </>
            )}

            {(confirmable || refundable) && (
              <>
                <Divider />
                {confirmable && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={confirmMutation.isPending}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Confirm manual payment
                  </Button>
                )}

                {refundable && !refunding && (
                  <Button size="small" color="error" onClick={openRefundForm} sx={{ alignSelf: 'flex-start' }}>
                    Issue refund
                  </Button>
                )}

                {refundable && refunding && (
                  <Stack spacing={1.5}>
                    <TextField
                      label={`Refund amount (max ${(remaining / 100).toFixed(2)})`}
                      size="small"
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                    />
                    <TextField
                      label="Reason (optional)"
                      size="small"
                      fullWidth
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={handleRefund}
                        disabled={refundMutation.isPending}
                      >
                        Confirm refund
                      </Button>
                      <Button size="small" onClick={() => setRefunding(false)}>
                        Back
                      </Button>
                    </Stack>
                  </Stack>
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
