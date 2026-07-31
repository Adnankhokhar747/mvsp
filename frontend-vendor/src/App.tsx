import { Navigate, Route, Routes } from 'react-router-dom'
import { AppProviders } from './app/providers/AppProviders'
import { VendorLayout } from './app/layouts/VendorLayout'
import { ProtectedRoute } from './app/router/ProtectedRoute'
import { LoginPage } from './features/auth/pages/LoginPage'
import { BookingsListPage } from './features/bookings/pages/BookingsListPage'
import { BookingDetailPage } from './features/bookings/pages/BookingDetailPage'

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
        </Routes>
      </VendorLayout>
    </AppProviders>
  )
}

export default App
