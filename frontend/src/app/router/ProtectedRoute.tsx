import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useMe } from '../../features/auth/hooks/useAuth'
import { PageLoader } from '../../shared/components/PageLoader'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { data: user, isLoading, isError } = useMe()

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (user.user_type !== 'admin') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 12 }}>
        <Typography color="text.secondary">
          Your account doesn't have access to the admin panel.
        </Typography>
      </Box>
    )
  }

  return <>{children}</>
}
