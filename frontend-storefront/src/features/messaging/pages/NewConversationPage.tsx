import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import { useVendor } from '../../vendors/hooks/useVendors'
import { useStartConversation } from '../hooks/useMessaging'
import { ErrorState } from '../../../shared/components/ErrorState'
import { extractErrorMessage } from '../../../shared/lib/api-client'

export function NewConversationPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: vendor, isLoading, isError, refetch } = useVendor(slug)
  const startMutation = useStartConversation()

  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (isError) {
    return <ErrorState message="Couldn't load this vendor." onRetry={() => refetch()} />
  }

  if (isLoading || !vendor) {
    return <Skeleton variant="rounded" height={200} />
  }

  const handleSend = async () => {
    setError(null)
    if (!message.trim()) {
      setError('Write a message first.')
      return
    }
    try {
      const conversation = await startMutation.mutateAsync({ vendorId: vendor.id, message: message.trim() })
      navigate(`/messages/${conversation.id}`, { replace: true })
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 480 }}>
      <Stack>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Message {vendor.business_name}
        </Typography>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            multiline
            minRows={4}
            fullWidth
            autoFocus
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={startMutation.isPending}
            sx={{ alignSelf: 'flex-start' }}
          >
            Send
          </Button>
        </Stack>
      </Paper>
    </Stack>
  )
}
