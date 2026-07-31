import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { useModerateService, useServices } from '../hooks/useServices'
import { ServiceStatusChip } from '../components/ServiceStatusChip'
import { FeatureServiceDialog } from '../components/FeatureServiceDialog'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { extractErrorMessage } from '../../../shared/lib/api-client'
import type { Service, ServiceStatus } from '../types'

const STATUS_TABS: Array<{ label: string; value: ServiceStatus | 'all' }> = [
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
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [menuService, setMenuService] = useState<Service | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [featureTarget, setFeatureTarget] = useState<Service | null>(null)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  const { data, isLoading, isError, refetch } = useServices({ page, status, search })
  const moderateMutation = useModerateService()

  const closeMenu = () => {
    setMenuAnchor(null)
    setMenuService(null)
  }

  const handleApprove = async (service: Service) => {
    closeMenu()
    try {
      await moderateMutation.mutateAsync({ serviceId: service.id, action: 'approve' })
      setToast({ message: `${service.title} approved.`, severity: 'success' })
    } catch (error) {
      setToast({ message: extractErrorMessage(error), severity: 'error' })
    }
  }

  const handleReject = async (service: Service) => {
    closeMenu()
    try {
      await moderateMutation.mutateAsync({ serviceId: service.id, action: 'reject' })
      setToast({ message: `${service.title} rejected.`, severity: 'success' })
    } catch (error) {
      setToast({ message: extractErrorMessage(error), severity: 'error' })
    }
  }

  const handleFeatureConfirm = async (featuredDays: number) => {
    if (!featureTarget) return
    try {
      await moderateMutation.mutateAsync({ serviceId: featureTarget.id, action: 'feature', featuredDays })
      setToast({ message: `${featureTarget.title} featured for ${featuredDays} days.`, severity: 'success' })
    } catch (error) {
      setToast({ message: extractErrorMessage(error), severity: 'error' })
    } finally {
      setFeatureTarget(null)
    }
  }

  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Services
        </Typography>
        <Typography color="text.secondary">Review and moderate vendor-submitted services.</Typography>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
        <ToggleButtonGroup
          value={status}
          exclusive
          size="small"
          onChange={(_, value) => {
            if (value !== null) {
              setStatus(value)
              setPage(1)
            }
          }}
        >
          {STATUS_TABS.map((tab) => (
            <ToggleButton key={tab.value} value={tab.value}>
              {tab.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <TextField
          size="small"
          placeholder="Search by title…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          sx={{ minWidth: 260 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        {isError ? (
          <ErrorState message="Couldn't load services." onRetry={() => refetch()} />
        ) : !isLoading && data?.data.length === 0 ? (
          <EmptyState title="No services found" description="Try a different filter or search term." />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : data?.data.map((service) => (
                      <TableRow key={service.id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Typography sx={{ fontWeight: 600 }}>{service.title}</Typography>
                            {service.is_featured && <Chip size="small" label="Featured" color="primary" />}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{service.vendor?.business_name ?? '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{service.category?.name ?? '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {money(service.base_price, service.currency_code, service.price_type)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <ServiceStatusChip status={service.status} />
                        </TableCell>
                        <TableCell align="right">
                          {service.status === 'draft' && (
                            <Button
                              size="small"
                              variant="contained"
                              sx={{ mr: 1 }}
                              onClick={() => handleApprove(service)}
                              disabled={moderateMutation.isPending}
                            >
                              Approve
                            </Button>
                          )}
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setMenuAnchor(e.currentTarget)
                              setMenuService(service)
                            }}
                          >
                            <MoreVertOutlinedIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {data && (
          <TablePagination
            component="div"
            count={data.meta.total}
            page={data.meta.current_page - 1}
            rowsPerPage={data.meta.per_page}
            rowsPerPageOptions={[data.meta.per_page]}
            onPageChange={(_, newPage) => setPage(newPage + 1)}
          />
        )}
      </Paper>

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
        {menuService?.status === 'draft' && (
          <MenuItem onClick={() => menuService && handleReject(menuService)}>Reject</MenuItem>
        )}
        {menuService?.status === 'active' && (
          <MenuItem
            onClick={() => {
              setFeatureTarget(menuService)
              closeMenu()
            }}
          >
            Feature
          </MenuItem>
        )}
      </Menu>

      <FeatureServiceDialog
        open={!!featureTarget}
        onClose={() => setFeatureTarget(null)}
        onConfirm={handleFeatureConfirm}
        isSubmitting={moderateMutation.isPending}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast ? <Alert severity={toast.severity}>{toast.message}</Alert> : undefined}
      </Snackbar>
    </Stack>
  )
}
