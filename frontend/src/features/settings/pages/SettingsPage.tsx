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
import Switch from '@mui/material/Switch'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { usePaymentGateways, useUpdatePaymentGateway } from '../hooks/useSettings'
import { GatewayConfigDialog } from '../components/GatewayConfigDialog'
import { ErrorState } from '../../../shared/components/ErrorState'
import type { PaymentGateway } from '../types'

export function SettingsPage() {
  const { data: gateways, isLoading, isError, refetch } = usePaymentGateways()
  const updateMutation = useUpdatePaymentGateway()
  const [configuring, setConfiguring] = useState<PaymentGateway | null>(null)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  const notify = (message: string, severity: 'success' | 'error') => setToast({ message, severity })

  const handleToggleActive = async (gateway: PaymentGateway) => {
    try {
      await updateMutation.mutateAsync({ id: gateway.id, payload: { is_active: !gateway.is_active } })
      notify(`${gateway.name} ${!gateway.is_active ? 'activated' : 'deactivated'}.`, 'success')
    } catch {
      notify('Failed to update gateway status.', 'error')
    }
  }

  const handleSetDefault = async (gateway: PaymentGateway) => {
    try {
      await updateMutation.mutateAsync({ id: gateway.id, payload: { is_default: true } })
      notify(`${gateway.name} is now the default gateway.`, 'success')
    } catch {
      notify('Failed to set default gateway.', 'error')
    }
  }

  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4" fontWeight={700}>
          Settings
        </Typography>
        <Typography color="text.secondary">
          Manage which payment gateways are available to vendors and customers platform-wide.
        </Typography>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        {isError ? (
          <ErrorState message="Couldn't load payment gateways." onRetry={() => refetch()} />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Gateway</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell>Default</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 4 }).map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : gateways?.map((gateway) => (
                      <TableRow key={gateway.id} hover>
                        <TableCell>
                          <Typography fontWeight={600}>{gateway.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {gateway.driver}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={gateway.is_active}
                            onChange={() => handleToggleActive(gateway)}
                            disabled={updateMutation.isPending}
                          />
                        </TableCell>
                        <TableCell>
                          {gateway.is_default ? (
                            <Chip size="small" label="Default" color="primary" variant="outlined" />
                          ) : (
                            <Button
                              size="small"
                              disabled={!gateway.is_active || updateMutation.isPending}
                              onClick={() => handleSetDefault(gateway)}
                            >
                              Set as default
                            </Button>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" onClick={() => setConfiguring(gateway)}>
                            Configure
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <GatewayConfigDialog gateway={configuring} onClose={() => setConfiguring(null)} onNotify={notify} />

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
