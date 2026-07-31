import { useNavigate } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ServiceForm } from '../components/ServiceForm'
import { useCreateService } from '../hooks/useServices'
import { extractErrorMessage } from '../../../shared/lib/api-client'
import type { ServicePayload } from '../api/services-api'

export function ServiceCreatePage() {
  const navigate = useNavigate()
  const createMutation = useCreateService()

  const handleSubmit = async (payload: ServicePayload) => {
    try {
      const service = await createMutation.mutateAsync(payload)
      navigate(`/services/${service.id}`, { replace: true })
    } catch (error) {
      throw new Error(extractErrorMessage(error))
    }
  }

  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          New service
        </Typography>
        <Typography color="text.secondary">
          New services start as a draft and need admin approval before going live.
        </Typography>
      </Stack>

      <ServiceForm submitLabel="Create service" onSubmit={handleSubmit} />
    </Stack>
  )
}
