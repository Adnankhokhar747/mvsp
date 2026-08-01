import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import { useConversation, useMessages, useSendMessage } from '../hooks/useMessaging'
import { useMe } from '../../auth/hooks/useAuth'
import { ErrorState } from '../../../shared/components/ErrorState'
import { extractErrorMessage } from '../../../shared/lib/api-client'

export function ConversationThreadPage() {
  const { id } = useParams<{ id: string }>()
  const conversationId = id ? Number(id) : undefined
  const { data: me } = useMe()
  const { data: conversation, isLoading: convLoading, isError, refetch } = useConversation(conversationId)
  const { data: messages, isLoading: messagesLoading } = useMessages(conversationId)
  const sendMutation = useSendMessage()

  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (isError) {
    return <ErrorState message="Couldn't load this conversation." onRetry={() => refetch()} />
  }

  const handleSend = async () => {
    if (!conversationId || !body.trim()) return
    setError(null)
    try {
      await sendMutation.mutateAsync({ conversationId, body: body.trim() })
      setBody('')
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  return (
    <Stack spacing={2} sx={{ maxWidth: 640, height: '75vh' }}>
      <Stack>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {convLoading || !conversation ? <Skeleton width={200} /> : conversation.vendor?.business_name}
        </Typography>
      </Stack>

      <Paper variant="outlined" sx={{ flexGrow: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={1.5} sx={{ mt: 'auto' }}>
          {messagesLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={40} />)
            : messages?.data.map((message) => {
                const isMine = message.sender_id === me?.id
                return (
                  <Stack key={message.id} sx={{ alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                    <Paper
                      sx={{
                        px: 2,
                        py: 1,
                        maxWidth: '75%',
                        bgcolor: isMine ? 'primary.main' : 'action.hover',
                        color: isMine ? 'primary.contrastText' : 'text.primary',
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {message.body}
                      </Typography>
                    </Paper>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(message.created_at).toLocaleString()}
                    </Typography>
                  </Stack>
                )
              })}
        </Stack>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}

      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          placeholder="Type a message…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          multiline
          maxRows={4}
        />
        <Button variant="contained" onClick={handleSend} disabled={!body.trim() || sendMutation.isPending}>
          Send
        </Button>
      </Stack>
    </Stack>
  )
}
