import { Navigate, Route, Routes } from 'react-router-dom'
import { AppProviders } from './app/providers/AppProviders'
import { VendorLayout } from './app/layouts/VendorLayout'
import { ProtectedRoute } from './app/router/ProtectedRoute'
import { LoginPage } from './features/auth/pages/LoginPage'
import { BookingsListPage } from './features/bookings/pages/BookingsListPage'
import { BookingDetailPage } from './features/bookings/pages/BookingDetailPage'
import { ServicesListPage } from './features/services/pages/ServicesListPage'
import { ServiceCreatePage } from './features/services/pages/ServiceCreatePage'
import { ServiceDetailPage } from './features/services/pages/ServiceDetailPage'
import { ProfilePage } from './features/vendor/pages/ProfilePage'

function App() {
  return (
    <AppProviders>
      <VendorLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/bookings" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id"
            element={
              <ProtectedRoute>
                <BookingDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <ServicesListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services/new"
            element={
              <ProtectedRoute>
                <ServiceCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services/:id"
            element={
              <ProtectedRoute>
                <ServiceDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </VendorLayout>
    </AppProviders>
  )
}

export default App
