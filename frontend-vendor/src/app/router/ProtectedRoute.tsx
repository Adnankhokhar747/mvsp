import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
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

  return <>{children}</>
}
