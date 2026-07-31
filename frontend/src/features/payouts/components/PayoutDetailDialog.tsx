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
import { useApprovePayout, useRejectPayout } from '../hooks/usePayouts'
import { PayoutStatusChip } from './PayoutStatusChip'
import { extractErrorMessage } from '../../../shared/lib/api-client'
import type { PayoutRequest } from '../types'

function money(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)
}

interface PayoutDetailDialogProps {
  payout: PayoutRequest | null
  onClose: () => void
  onNotify: (message: string, severity: 'success' | 'error') => void
}

export function PayoutDetailDialog({ payout, onClose, onNotify }: PayoutDetailDialogProps) {
  const approveMutation = useApprovePayout()
  const rejectMutation = useRejectPayout()
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')

  const handleClose = () => {
    setRejecting(false)
    setReason('')
    onClose()
  }

  const handleApprove = async () => {
    if (!payout) return
    try {
      await approveMutation.mutateAsync(payout.id)
      onNotify('Payout approved and marked as paid.', 'success')
    } catch (error) {
      onNotify(extractErrorMessage(error), 'error')
    }
  }

  const handleReject = async () => {
    if (!payout || !reason.trim()) {
      onNotify('A rejection reason is required.', 'error')
      return
    }
    try {
      await rejectMutation.mutateAsync({ id: payout.id, reason })
      onNotify('Payout rejected and funds released back to the wallet.', 'success')
      setRejecting(false)
      setReason('')
    } catch (error) {
      onNotify(extractErrorMessage(error), 'error')
    }
  }

  const pending = payout?.status === 'pending'

  return (
    <Dialog open={payout !== null} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Payout request</DialogTitle>
      {payout && (
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {payout.vendor?.business_name}
              </Typography>
              <PayoutStatusChip status={payout.status} />
            </Stack>

            <Stack direction="row" spacing={4}>
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="body2">{money(payout.amount, payout.currency_code)}</Typography>
              </Stack>
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  Method
                </Typography>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {payout.method.replace('_', ' ')}
                </Typography>
              </Stack>
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  Requested
                </Typography>
                <Typography variant="body2">{new Date(payout.requested_at).toLocaleString()}</Typography>
              </Stack>
            </Stack>

            <Divider />

            {payout.bank_account ? (
              <Stack>
                <Typography variant="subtitle2" gutterBottom>
                  Bank details
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2">{payout.bank_account.account_holder_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {payout.bank_account.bank_name} — {payout.bank_account.account_number}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    IBAN/Routing: {payout.bank_account.iban_or_routing}
                  </Typography>
                </Stack>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No bank account on file for this request.
              </Typography>
            )}

            {payout.status === 'rejected' && payout.rejection_reason && (
              <>
                <Divider />
                <Stack>
                  <Typography variant="caption" color="text.secondary">
                    Rejection reason
                  </Typography>
                  <Typography variant="body2">{payout.rejection_reason}</Typography>
                </Stack>
              </>
            )}

            {payout.processed_by && (
              <Typography variant="caption" color="text.secondary">
                Processed by {payout.processed_by} on{' '}
                {payout.processed_at ? new Date(payout.processed_at).toLocaleString() : '—'}
              </Typography>
            )}

            {pending && (
              <>
                <Divider />
                {!rejecting ? (
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleApprove}
                      disabled={approveMutation.isPending}
                    >
                      Approve &amp; pay out
                    </Button>
                    <Button size="small" color="error" onClick={() => setRejecting(true)}>
                      Reject
                    </Button>
                  </Stack>
                ) : (
                  <Stack spacing={1.5}>
                    <TextField
                      label="Rejection reason"
                      size="small"
                      fullWidth
                      required
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={handleReject}
                        disabled={rejectMutation.isPending}
                      >
                        Confirm rejection
                      </Button>
                      <Button size="small" onClick={() => setRejecting(false)}>
                        Back
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </>
            )}
          </Stack>
        </DialogContent>
      )}
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
