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
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { useMe } from '../../auth/hooks/useAuth'
import {
  usePlatformRoles,
  useReactivateStaff,
  useStaffList,
  useSuspendStaff,
  useUpdateStaffRole,
} from '../hooks/useStaff'
import { StaffFormDialog } from '../components/StaffFormDialog'
import { StaffStatusChip } from '../components/StaffStatusChip'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { extractErrorMessage } from '../../../shared/lib/api-client'
import type { StaffMember, StaffStatus } from '../types'

const STATUS_OPTIONS: Array<{ label: string; value: StaffStatus | 'all' }> = [
  { label: 'All statuses', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
]

export function StaffListPage() {
  const { data: me } = useMe()
  const [status, setStatus] = useState<StaffStatus | 'all'>('all')
  const [role, setRole] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  const { data, isLoading, isError, refetch } = useStaffList({ page, status, role })
  const { data: roles } = usePlatformRoles()
  const updateRoleMutation = useUpdateStaffRole()
  const suspendMutation = useSuspendStaff()
  const reactivateMutation = useReactivateStaff()

  const notify = (message: string, severity: 'success' | 'error') => setToast({ message, severity })

  const handleRoleChange = async (member: StaffMember, newRole: string) => {
    try {
      await updateRoleMutation.mutateAsync({ id: member.id, role: newRole })
      notify(`${member.name}'s role updated to ${newRole}.`, 'success')
    } catch (error) {
      notify(extractErrorMessage(error), 'error')
    }
  }

  const handleSuspend = async (member: StaffMember) => {
    try {
      await suspendMutation.mutateAsync({ id: member.id })
      notify(`${member.name} suspended.`, 'success')
    } catch (error) {
      notify(extractErrorMessage(error), 'error')
    }
  }

  const handleReactivate = async (member: StaffMember) => {
    try {
      await reactivateMutation.mutateAsync(member.id)
      notify(`${member.name} reactivated.`, 'success')
    } catch (error) {
      notify(extractErrorMessage(error), 'error')
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Stack>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Staff &amp; Roles
          </Typography>
          <Typography color="text.secondary">Manage platform admin accounts and their roles.</Typography>
        </Stack>
        <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setCreateOpen(true)}>
          New staff member
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as StaffStatus | 'all')
            setPage(1)
          }}
          sx={{ minWidth: 160 }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Role"
          value={role}
          onChange={(e) => {
            setRole(e.target.value)
            setPage(1)
          }}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">All roles</MenuItem>
          {roles?.map((r) => (
            <MenuItem key={r.name} value={r.name}>
              {r.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        {isError ? (
          <ErrorState message="Couldn't load staff." onRetry={() => refetch()} />
        ) : !isLoading && data?.data.length === 0 ? (
          <EmptyState title="No staff members found" description="Try a different filter." />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
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
                  : data?.data.map((member) => {
                      const isSelf = member.id === me?.id
                      return (
                        <TableRow key={member.id} hover>
                          <TableCell>
                            <Typography sx={{ fontWeight: 600 }}>
                              {member.name}
                              {isSelf && ' (you)'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <TextField
                              select
                              size="small"
                              value={member.roles[0] ?? ''}
                              onChange={(e) => handleRoleChange(member, e.target.value)}
                              disabled={updateRoleMutation.isPending}
                              sx={{ minWidth: 170 }}
                            >
                              {roles?.map((r) => (
                                <MenuItem key={r.name} value={r.name}>
                                  {r.name}
                                </MenuItem>
                              ))}
                            </TextField>
                          </TableCell>
                          <TableCell>
                            <StaffStatusChip status={member.status} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{new Date(member.created_at).toLocaleDateString()}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            {member.status === 'active' ? (
                              <Button
                                size="small"
                                color="error"
                                disabled={isSelf || suspendMutation.isPending}
                                onClick={() => handleSuspend(member)}
                              >
                                Suspend
                              </Button>
                            ) : (
                              <Button size="small" disabled={reactivateMutation.isPending} onClick={() => handleReactivate(member)}>
                                Reactivate
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
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

      <StaffFormDialog open={createOpen} onClose={() => setCreateOpen(false)} onNotify={notify} />

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
