import { Link as RouterLink } from 'react-router-dom'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined'
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import MiscellaneousServicesOutlinedIcon from '@mui/icons-material/MiscellaneousServicesOutlined'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded'
import { useMe } from '../../auth/hooks/useAuth'
import { useMyVendor } from '../../vendor/hooks/useVendor'
import { useBookings } from '../../bookings/hooks/useBookings'
import { useVendorServices } from '../../services/hooks/useServices'
import { useWallet } from '../../wallet/hooks/useWallet'
import { useConversations } from '../../messaging/hooks/useMessaging'
import { BookingStatusChip } from '../../bookings/components/BookingStatusChip'
import { EmptyState } from '../../../shared/components/EmptyState'

function money(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)
}

function StatCard({
  icon,
  label,
  value,
  loading,
}: {
  icon: React.ReactNode
  label: string
  value: string | number | undefined
  loading: boolean
}) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Stack
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Stack>
        <Stack sx={{ minWidth: 0 }}>
          {loading ? (
            <Skeleton width={56} height={32} />
          ) : (
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {value ?? '—'}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" noWrap>
            {label}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  )
}

export function OverviewPage() {
  const { data: user } = useMe()
  const { data: myVendor } = useMyVendor()
  const { data: pending, isLoading: pendingLoading } = useBookings({ page: 1, status: 'pending' })
  const { data: confirmed, isLoading: confirmedLoading } = useBookings({ page: 1, status: 'confirmed' })
  const { data: activeServices, isLoading: activeServicesLoading } = useVendorServices({ page: 1, status: 'active' })
  const { data: wallet, isLoading: walletLoading } = useWallet()
  const { data: conversations, isLoading: conversationsLoading } = useConversations(1)

  const unreadMessages = (conversations?.data ?? []).reduce((sum, c) => sum + c.unread_count, 0)
  const needsAttention = pending?.data.slice(0, 5) ?? []

  return (
    <Stack spacing={4}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Stack>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}
          </Typography>
          <Typography color="text.secondary">
            {myVendor ? `Here's what's happening at ${myVendor.vendor.business_name}.` : "Here's what's happening."}
          </Typography>
        </Stack>
        <Button component={RouterLink} to="/services/new" variant="contained">
          New service
        </Button>
      </Stack>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<PendingActionsOutlinedIcon />}
            label="Needs a response"
            value={pending?.meta.total}
            loading={pendingLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<EventNoteOutlinedIcon />}
            label="Confirmed bookings"
            value={confirmed?.meta.total}
            loading={confirmedLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<MiscellaneousServicesOutlinedIcon />}
            label="Active services"
            value={activeServices?.meta.total}
            loading={activeServicesLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<AccountBalanceWalletOutlinedIcon />}
            label="Wallet balance"
            value={wallet ? money(wallet.balance, wallet.currency_code) : undefined}
            loading={walletLoading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant="outlined">
            <Stack sx={{ p: 2.5, pb: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Needs your attention
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bookings waiting on a quote or a status update from you.
              </Typography>
            </Stack>
            {pendingLoading ? (
              <Stack sx={{ p: 2.5, pt: 0 }} spacing={1}>
                <Skeleton width="70%" />
                <Skeleton width="50%" />
              </Stack>
            ) : needsAttention.length === 0 ? (
              <EmptyState title="All caught up" description="No bookings are waiting on you right now." />
            ) : (
              <List disablePadding>
                {needsAttention.map((booking) => (
                  <ListItemButton key={booking.id} component={RouterLink} to={`/bookings/${booking.id}`} divider sx={{ py: 1.75 }}>
                    <ListItemText
                      slotProps={{ primary: { component: 'div' }, secondary: { component: 'div' } }}
                      primary={
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Typography sx={{ fontWeight: 600 }}>{booking.service?.title}</Typography>
                          <BookingStatusChip status={booking.status} />
                        </Stack>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {booking.customer?.name}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
            {!pendingLoading && needsAttention.length > 0 && (
              <Stack sx={{ p: 1.5 }}>
                <Button component={RouterLink} to="/bookings" size="small">
                  View all bookings
                </Button>
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined">
            <Stack direction="row" sx={{ p: 2.5, pb: 1.5, justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Messages
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Recent conversations with customers.
                </Typography>
              </Stack>
              {unreadMessages > 0 && <Chip size="small" label={`${unreadMessages} unread`} color="primary" />}
            </Stack>
            {conversationsLoading ? (
              <Stack sx={{ p: 2.5, pt: 0 }} spacing={1}>
                <Skeleton width="70%" />
                <Skeleton width="50%" />
              </Stack>
            ) : (conversations?.data.length ?? 0) === 0 ? (
              <EmptyState title="No conversations yet" description="Messages from customers will show up here." />
            ) : (
              <List disablePadding>
                {conversations!.data.slice(0, 5).map((conversation) => (
                  <ListItemButton key={conversation.id} component={RouterLink} to={`/messages/${conversation.id}`} divider sx={{ py: 1.5 }}>
                    <ListItemText
                      primary={conversation.customer?.name ?? 'Customer'}
                      secondary={
                        conversation.last_message_at ? new Date(conversation.last_message_at).toLocaleString() : 'No messages yet'
                      }
                      slotProps={{ primary: { sx: { fontWeight: conversation.unread_count > 0 ? 700 : 500 } } }}
                    />
                    {conversation.unread_count > 0 && (
                      <Chip size="small" label={conversation.unread_count} color="primary" sx={{ ml: 1 }} />
                    )}
                  </ListItemButton>
                ))}
              </List>
            )}
            {!conversationsLoading && (conversations?.data.length ?? 0) > 0 && (
              <Stack sx={{ p: 1.5 }}>
                <Button component={RouterLink} to="/messages" size="small" startIcon={<ChatBubbleOutlineRoundedIcon fontSize="small" />}>
                  View all messages
                </Button>
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}
