import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import { useReviewKycDocument, useVendorKycDocuments } from '../hooks/useVendors'
import { openKycDocument } from '../api/vendors-api'
import { KycDocumentStatusChip } from './KycDocumentStatusChip'
import { extractErrorMessage } from '../../../shared/lib/api-client'
import { EmptyState } from '../../../shared/components/EmptyState'
import type { Vendor, VendorKycDocument } from '../types'

interface VendorKycDialogProps {
  vendor: Vendor | null
  onClose: () => void
  onNotify: (message: string, severity: 'success' | 'error') => void
}

function DocumentRow({
  vendorId,
  document,
  onNotify,
}: {
  vendorId: number
  document: VendorKycDocument
  onNotify: (message: string, severity: 'success' | 'error') => void
}) {
  const reviewMutation = useReviewKycDocument()
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [opening, setOpening] = useState(false)

  const handleDownload = async () => {
    setOpening(true)
    try {
      await openKycDocument(vendorId, document.id)
    } catch (error) {
      onNotify(extractErrorMessage(error), 'error')
    } finally {
      setOpening(false)
    }
  }

  const handleApprove = async () => {
    try {
      await reviewMutation.mutateAsync({ vendorId, documentId: document.id, status: 'approved' })
      onNotify('Document approved.', 'success')
    } catch (error) {
      onNotify(extractErrorMessage(error), 'error')
    }
  }

  const handleReject = async () => {
    if (!reason.trim()) {
      onNotify('A rejection reason is required.', 'error')
      return
    }
    try {
      await reviewMutation.mutateAsync({ vendorId, documentId: document.id, status: 'rejected', reason })
      onNotify('Document rejected.', 'success')
      setRejecting(false)
      setReason('')
    } catch (error) {
      onNotify(extractErrorMessage(error), 'error')
    }
  }

  return (
    <Stack spacing={1} sx={{ py: 1.5 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {document.document_type?.name ?? 'Document'}
          </Typography>
          <Link
            component="button"
            type="button"
            onClick={handleDownload}
            variant="caption"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
            disabled={opening}
          >
            Download file <FileDownloadOutlinedIcon sx={{ fontSize: 14 }} />
          </Link>
        </Stack>
        <KycDocumentStatusChip status={document.status} />
      </Stack>

      {document.status === 'rejected' && document.rejected_reason && (
        <Typography variant="caption" color="text.secondary">
          Reason: {document.rejected_reason}
        </Typography>
      )}

      {document.status === 'pending' && (
        <>
          {!rejecting ? (
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="contained" onClick={handleApprove} disabled={reviewMutation.isPending}>
                Approve
              </Button>
              <Button size="small" color="error" onClick={() => setRejecting(true)}>
                Reject
              </Button>
            </Stack>
          ) : (
            <Stack spacing={1}>
              <TextField
                label="Rejection reason"
                size="small"
                fullWidth
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="contained" color="error" onClick={handleReject} disabled={reviewMutation.isPending}>
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
  )
}

export function VendorKycDialog({ vendor, onClose, onNotify }: VendorKycDialogProps) {
  const { data: documents, isLoading } = useVendorKycDocuments(vendor?.id ?? null)

  return (
    <Dialog open={vendor !== null} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{vendor?.business_name} — KYC documents</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : !documents?.length ? (
          <EmptyState title="No documents uploaded" description="This vendor hasn't submitted any KYC documents yet." />
        ) : (
          <Stack divider={<Divider />}>
            {documents.map((document) => (
              <DocumentRow key={document.id} vendorId={vendor!.id} document={document} onNotify={onNotify} />
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
