import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../shared/lib/api-client'
import { useMe } from '../../auth/hooks/useAuth'

interface VendorListMeta {
  meta: { total: number }
}

function useVendorCount(status?: string) {
  return useQuery({
    queryKey: ['admin', 'vendors', 'count', status ?? 'all'],
    queryFn: async () => {
      const { data } = await apiClient.get<VendorListMeta>('/admin/vendors', {
        params: status ? { 'filter[status]': status } : {},
      })
      return data.meta.total
    },
  })
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number | undefined
}) {
  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
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
          }}
        >
          {icon}
        </Stack>
        <Stack>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {value ?? '—'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  )
}

export function OverviewPage() {
  const { data: user } = useMe()
  const { data: totalVendors } = useVendorCount()
  const { data: pendingVendors } = useVendorCount('pending')

  return (
    <Stack spacing={4}>
      <Stack>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}
        </Typography>
        <Typography color="text.secondary">Here's what's happening on the platform.</Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<StorefrontOutlinedIcon />} label="Total vendors" value={totalVendors} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<PendingActionsOutlinedIcon />} label="Pending approval" value={pendingVendors} />
        </Grid>
      </Grid>
    </Stack>
  )
}
