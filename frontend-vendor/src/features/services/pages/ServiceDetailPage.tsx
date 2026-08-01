import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import {
  useCreatePackage,
  useDeletePackage,
  useUpdateService,
  useUploadServiceMedia,
  useSetAvailability,
  useVendorService,
} from '../hooks/useServices'
import { ServiceForm } from '../components/ServiceForm'
import { MediaGallery } from '../components/MediaGallery'
import { AvailabilityEditor } from '../components/AvailabilityEditor'
import { PackagesEditor } from '../components/PackagesEditor'
import { ServiceStatusChip } from '../components/ServiceStatusChip'
import { ErrorState } from '../../../shared/components/ErrorState'
import { extractErrorMessage } from '../../../shared/lib/api-client'
import type { ServicePackagePayload, ServicePayload } from '../api/services-api'
import type { ServiceAvailabilitySlot } from '../types'

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const serviceId = id ? Number(id) : undefined
  const { data: service, isLoading, isError, refetch } = useVendorService(serviceId)
  const updateMutation = useUpdateService()
  const uploadMediaMutation = useUploadServiceMedia()
  const availabilityMutation = useSetAvailability()
  const createPackageMutation = useCreatePackage()
  const deletePackageMutation = useDeletePackage()

  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  if (isError) {
    return <ErrorState message="Couldn't load this service." onRetry={() => refetch()} />
  }

  if (isLoading || !service) {
    return (
      <Stack spacing={2}>
        <Skeleton width="40%" height={40} />
        <Skeleton variant="rounded" height={240} />
      </Stack>
    )
  }

  const handleUpdate = async (payload: ServicePayload) => {
    try {
      await updateMutation.mutateAsync({ id: service.id, payload })
      setToast({ message: 'Service saved.', severity: 'success' })
    } catch (error) {
      throw new Error(extractErrorMessage(error))
    }
  }

  const handleUpload = async (file: File) => {
    try {
      await uploadMediaMutation.mutateAsync({ id: service.id, file })
      setToast({ message: 'Photo uploaded.', severity: 'success' })
    } catch (error) {
      throw new Error(extractErrorMessage(error))
    }
  }

  const handleSaveAvailability = async (slots: ServiceAvailabilitySlot[]) => {
    try {
      await availabilityMutation.mutateAsync({ id: service.id, slots })
      setToast({ message: 'Availability saved.', severity: 'success' })
    } catch (error) {
      throw new Error(extractErrorMessage(error))
    }
  }

  const handleCreatePackage = async (payload: ServicePackagePayload) => {
    try {
      await createPackageMutation.mutateAsync({ serviceId: service.id, payload })
      setToast({ message: 'Package added.', severity: 'success' })
    } catch (error) {
      throw new Error(extractErrorMessage(error))
    }
  }

  const handleDeletePackage = async (packageId: number) => {
    try {
      await deletePackageMutation.mutateAsync({ serviceId: service.id, packageId })
      setToast({ message: 'Package removed.', severity: 'success' })
    } catch (error) {
      throw new Error(extractErrorMessage(error))
    }
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 640 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {service.title}
        </Typography>
        <ServiceStatusChip status={service.status} />
      </Stack>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <ServiceForm service={service} showStatus submitLabel="Save changes" onSubmit={handleUpdate} />
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Photos
          </Typography>
          <MediaGallery media={service.media} onUpload={handleUpload} />
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Packages
          </Typography>
          <PackagesEditor
            packages={service.packages}
            currencyCode={service.currency_code}
            onCreate={handleCreatePackage}
            onDelete={handleDeletePackage}
          />
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Availability
          </Typography>
          <Divider />
          <AvailabilityEditor existing={service.availability} onSave={handleSaveAvailability} />
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
