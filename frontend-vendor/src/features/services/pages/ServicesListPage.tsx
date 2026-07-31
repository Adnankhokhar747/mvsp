import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Pagination from '@mui/material/Pagination'
import { useVendorServices } from '../hooks/useServices'
import { ServiceStatusChip } from '../components/ServiceStatusChip'
import { ErrorState } from '../../../shared/components/ErrorState'
import { EmptyState } from '../../../shared/components/EmptyState'
import type { ServiceStatus } from '../types'

const STATUS_OPTIONS: Array<{ label: string; value: ServiceStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Rejected', value: 'rejected' },
]

function money(amount: number, currency: string, priceType: string) {
  if (priceType === 'quote') return 'Quote on request'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)
}

export function ServicesListPage() {
  const [status, setStatus] = useState<ServiceStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useVendorServices({ page, status })

  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Stack>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Services
          </Typography>
          <Typography color="text.secondary">Manage what you offer, pricing, and availability.</Typography>
        </Stack>
        <Button component={RouterLink} to="/services/new" variant="contained">
          New service
        </Button>
      </Stack>

      <TextField
        select
        size="small"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value as ServiceStatus | 'all')
          setPage(1)
        }}
        sx={{ minWidth: 180 }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>

      <Paper variant="outlined">
        {isError ? (
          <ErrorState message="Couldn't load your services." onRetry={() => refetch()} />
        ) : !isLoading && data?.data.length === 0 ? (
          <EmptyState
            title="No services yet"
            description="Create your first service to start receiving bookings."
            action={
              <Button component={RouterLink} to="/services/new" variant="contained">
                New service
              </Button>
            }
          />
        ) : (
          <List disablePadding>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Stack key={i} sx={{ p: 2 }}>
                    <Skeleton width="60%" />
                    <Skeleton width="40%" />
                  </Stack>
                ))
              : data?.data.map((service) => (
                  <ListItemButton
                    key={service.id}
                    component={RouterLink}
                    to={`/services/${service.id}`}
                    divider
                    sx={{ py: 2 }}
                  >
                    <ListItemText
                      slotProps={{ primary: { component: 'div' }, secondary: { component: 'div' } }}
                      primary={
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Typography sx={{ fontWeight: 600 }}>{service.title}</Typography>
                          <ServiceStatusChip status={service.status} />
                        </Stack>
                      }
                      secondary={
                        <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {service.category?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {money(service.base_price, service.currency_code, service.price_type)}
                          </Typography>
                        </Stack>
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
