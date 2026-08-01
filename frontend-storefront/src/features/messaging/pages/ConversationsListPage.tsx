import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Badge from '@mui/material/Badge'
import Skeleton from '@mui/material/Skeleton'
import Pagination from '@mui/material/Pagination'
import { useConversations } from '../hooks/useMessaging'
import { ErrorState } from '../../../shared/components/ErrorState'
import { EmptyState } from '../../../shared/components/EmptyState'

export function ConversationsListPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useConversations(page)

  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Messages
        </Typography>
        <Typography color="text.secondary">Your conversations with vendors.</Typography>
      </Stack>

      <Paper variant="outlined">
        {isError ? (
          <ErrorState message="Couldn't load your messages." onRetry={() => refetch()} />
        ) : !isLoading && data?.data.length === 0 ? (
          <EmptyState title="No conversations yet" description="Message a vendor from their profile page." />
        ) : (
          <List disablePadding>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Stack key={i} sx={{ p: 2 }}>
                    <Skeleton width="60%" />
                    <Skeleton width="40%" />
                  </Stack>
                ))
              : data?.data.map((conversation) => (
                  <ListItemButton
                    key={conversation.id}
                    component={RouterLink}
                    to={`/messages/${conversation.id}`}
                    divider
                    sx={{ py: 2 }}
                  >
                    <ListItemText
                      slotProps={{ secondary: { component: 'div' } }}
                      primary={
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Typography sx={{ fontWeight: conversation.unread_count > 0 ? 700 : 500 }}>
                            {conversation.vendor?.business_name}
                          </Typography>
                          {conversation.unread_count > 0 && (
                            <Badge badgeContent={conversation.unread_count} color="primary" />
                          )}
                        </Stack>
                      }
                      secondary={
                        conversation.last_message_at && (
                          <Typography variant="body2" color="text.secondary">
                            {new Date(conversation.last_message_at).toLocaleString()}
                          </Typography>
                        )
                      }
                    />
                  </ListItemButton>
                ))}
          </List>
        )}

        {data && data.meta.last_page > 1 && (
          <Stack sx={{ alignItems: 'center', py: 2 }}>
            <Pagination count={data.meta.last_page} page={data.meta.current_page} onChange={(_, v) => setPage(v)} />
          </Stack>
        )}
      </Paper>
    </Stack>
  )
}
