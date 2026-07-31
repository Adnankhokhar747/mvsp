import { useRef, useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import { useKycDocumentTypes, useKycDocuments, useUploadKycDocument } from '../hooks/useVendor'
import { EmptyState } from '../../../shared/components/EmptyState'
import { extractErrorMessage } from '../../../shared/lib/api-client'
import type { KycDocumentStatus } from '../types'

const STATUS_COLOR: Record<KycDocumentStatus, 'success' | 'warning' | 'error'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
}

export function KycDocumentsPanel({ vendorId }: { vendorId: number }) {
  const { data: types } = useKycDocumentTypes()
  const { data: documents } = useKycDocuments(vendorId)
  const uploadMutation = useUploadKycDocument()
  const inputRef = useRef<HTMLInputElement>(null)
  const [pendingTypeId, setPendingTypeId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePick = (typeId: number) => {
    setPendingTypeId(typeId)
    inputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || pendingTypeId === null) return
    setError(null)
    try {
      await uploadMutation.mutateAsync({ vendorId, kycDocumentTypeId: pendingTypeId, file })
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      if (inputRef.current) inputRef.current.value = ''
      setPendingTypeId(null)
    }
  }

  const latestFor = (typeId: number) =>
    documents?.filter((d) => d.kyc_document_type_id === typeId).sort((a, b) => b.id - a.id)[0]

  if (!types?.length) {
    return <EmptyState title="No document types configured" />
  }

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <input ref={inputRef} type="file" accept=".pdf,image/jpeg,image/png" hidden onChange={handleFileChange} />
      {types.map((type) => {
        const doc = latestFor(type.id)
        return (
          <Paper key={type.id} variant="outlined" sx={{ p: 2.5 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Stack spacing={0.5}>
                <Typography sx={{ fontWeight: 600 }}>
                  {type.name}
                  {type.is_required ? ' *' : ''}
                </Typography>
                {type.instructions && (
                  <Typography variant="caption" color="text.secondary">
                    {type.instructions}
                  </Typography>
                )}
                {doc?.status === 'rejected' && doc.rejected_reason && (
                  <Typography variant="caption" color="error.main">
                    Rejected: {doc.rejected_reason}
                  </Typography>
                )}
              </Stack>
              <Stack spacing={1} sx={{ alignItems: 'flex-end' }}>
                {doc && <Chip size="small" label={doc.status} color={STATUS_COLOR[doc.status]} variant="outlined" />}
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handlePick(type.id)}
                  disabled={uploadMutation.isPending}
                >
                  {doc ? 'Re-upload' : 'Upload'}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        )
      })}
      <Divider />
      <Typography variant="caption" color="text.secondary">
        Accepted formats: PDF, JPG, PNG (max 5MB). An admin reviews each submission.
      </Typography>
    </Stack>
  )
}
