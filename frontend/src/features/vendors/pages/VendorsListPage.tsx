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
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { useApproveVendor, useRejectVendor, useSuspendVendor, useVendors } from '../hooks/useVendors'
import { VendorStatusChip } from '../components/VendorStatusChip'
import { RejectVendorDialog } from '../components/RejectVendorDialog'
import { VendorKycDialog } from '../components/VendorKycDialog'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { extractErrorMessage } from '../../../shared/lib/api-client'
import type { Vendor, VendorStatus } from '../types'

const STATUS_TABS: Array<{ label: string; value: VendorStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Suspended', value: 'suspended' },
]

export function VendorsListPage() {
  const [status, setStatus] = useState<VendorStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [menuVendor, setMenuVendor] = useState<Vendor | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Vendor | null>(null)
  const [kycTarget, setKycTarget] = useState<Vendor | null>(null)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  const { data, isLoading, isError, refetch } = useVendors({ page, status, search })
  const approveMutation = useApproveVendor()
  const rejectMutation = useRejectVendor()
  const suspendMutation = useSuspendVendor()

  const closeMenu = () => {
    setMenuAnchor(null)
    setMenuVendor(null)
  }

  const handleApprove = async (vendor: Vendor) => {
    closeMenu()
    try {
      await approveMutation.mutateAsync(vendor.id)
      setToast({ message: `${vendor.business_name} approved.`, severity: 'success' })
    } catch (error) {
      setToast({ message: extractErrorMessage(error), severity: 'error' })
    }
  }

  const handleSuspend = async (vendor: Vendor) => {
    closeMenu()
    try {
      await suspendMutation.mutateAsync({ vendorId: vendor.id })
      setToast({ message: `${vendor.business_name} suspended.`, severity: 'success' })
    } catch (error) {
      setToast({ message: extractErrorMessage(error), severity: 'error' })
    }
  }

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return
    try {
      await rejectMutation.mutateAsync({ vendorId: rejectTarget.id, reason })
      setToast({ message: `${rejectTarget.business_name} rejected.`, severity: 'success' })
    } catch (error) {
      setToast({ message: extractErrorMessage(error), severity: 'error' })
    } finally {
      setRejectTarget(null)
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Stack>
          <Typography variant="h4" fontWeight={700}>
            Vendors
          </Typography>
          <Typography color="text.secondary">Review applications and manage vendor accounts.</Typography>
        </Stack>
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
          placeholder="Search by business name…"
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
          <ErrorState message="Couldn't load vendors." onRetry={() => refetch()} />
        ) : !isLoading && data?.data.length === 0 ? (
          <EmptyState
            title="No vendors found"
            description="Try a different filter or search term."
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Business</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Applied</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : data?.data.map((vendor) => (
                      <TableRow key={vendor.id} hover>
                        <TableCell>
                          <Typography fontWeight={600}>{vendor.business_name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {vendor.slug}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{vendor.email ?? '—'}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {vendor.phone ?? ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <VendorStatusChip status={vendor.status} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(vendor.created_at).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {vendor.status === 'pending' && (
                            <Button
                              size="small"
                              variant="contained"
                              sx={{ mr: 1 }}
                              onClick={() => handleApprove(vendor)}
                              disabled={approveMutation.isPending}
                            >
                              Approve
                            </Button>
                          )}
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setMenuAnchor(e.currentTarget)
                              setMenuVendor(vendor)
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
        <MenuItem
          onClick={() => {
            setKycTarget(menuVendor)
            closeMenu()
          }}
        >
          View KYC documents
        </MenuItem>
        {menuVendor?.status === 'pending' && (
          <MenuItem
            onClick={() => {
              setRejectTarget(menuVendor)
              closeMenu()
            }}
          >
            Reject
          </MenuItem>
        )}
        {menuVendor?.status !== 'suspended' && (
          <MenuItem onClick={() => menuVendor && handleSuspend(menuVendor)}>Suspend</MenuItem>
        )}
      </Menu>

      <RejectVendorDialog
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
        isSubmitting={rejectMutation.isPending}
      />

      <VendorKycDialog
        vendor={kycTarget}
        onClose={() => setKycTarget(null)}
        onNotify={(message, severity) => setToast({ message, severity })}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast && <Alert severity={toast.severity}>{toast.message}</Alert>}
      </Snackbar>
    </Stack>
  )
}
