import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { useMyVendor, useUpdateVendor } from '../hooks/useVendor'
import { useMe } from '../../auth/hooks/useAuth'
import { VendorProfileForm } from '../components/VendorProfileForm'
import { VendorStatusChip } from '../components/VendorStatusChip'
import { KycDocumentsPanel } from '../components/KycDocumentsPanel'
import { StaffPanel } from '../components/StaffPanel'
import { ErrorState } from '../../../shared/components/ErrorState'
import { EmptyState } from '../../../shared/components/EmptyState'
import { extractErrorMessage } from '../../../shared/lib/api-client'
import type { VendorProfilePayload } from '../api/vendor-api'

export function ProfilePage() {
  const { data: me } = useMe()
  const { data: myVendor, isLoading, isError, refetch } = useMyVendor()
  const updateMutation = useUpdateVendor()
  const [tab, setTab] = useState(0)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton width="40%" height={40} />
        <Skeleton variant="rounded" height={240} />
      </Stack>
    )
  }

  if (isError) {
    return <ErrorState message="Couldn't load your vendor profile." onRetry={() => refetch()} />
  }

  if (!myVendor) {
    return <EmptyState title="No vendor profile" description="You're not a member of any vendor team yet." />
  }

  const { vendor, role } = myVendor
  const canManage = role === 'owner' || role === 'manager'

  const handleSaveProfile = async (payload: VendorProfilePayload) => {
    try {
      await updateMutation.mutateAsync({ id: vendor.id, payload })
      setToast({ message: 'Profile saved.', severity: 'success' })
    } catch (error) {
      throw new Error(extractErrorMessage(error))
    }
  }

  const tabs = canManage
    ? [
        { label: 'Profile', key: 'profile' },
        { label: 'Verification', key: 'kyc' },
        { label: 'Team', key: 'team' },
      ]
    : [{ label: 'Team', key: 'team' }]

  const activeKey = tabs[tab]?.key ?? tabs[0].key

  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {vendor.business_name}
          </Typography>
          <Typography color="text.secondary">Manage your vendor profile and team.</Typography>
        </Stack>
        <VendorStatusChip status={vendor.status} />
      </Stack>

      <Paper variant="outlined">
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          {tabs.map((t) => (
            <Tab key={t.key} label={t.label} />
          ))}
        </Tabs>
        <Stack sx={{ p: 3 }}>
          {activeKey === 'profile' && <VendorProfileForm vendor={vendor} onSave={handleSaveProfile} />}
          {activeKey === 'kyc' && <KycDocumentsPanel vendorId={vendor.id} />}
          {activeKey === 'team' && me && (
            <StaffPanel vendorId={vendor.id} canManage={canManage} currentUserId={me.id} />
          )}
        </Stack>
      </Paper>

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
