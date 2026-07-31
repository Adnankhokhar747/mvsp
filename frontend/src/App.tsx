import { Navigate, Route, Routes } from 'react-router-dom'
import { AppProviders } from './app/providers/AppProviders'
import { ProtectedRoute } from './app/router/ProtectedRoute'
import { AdminLayout } from './app/layouts/AdminLayout'
import { LoginPage } from './features/auth/pages/LoginPage'
import { OverviewPage } from './features/overview/pages/OverviewPage'
import { VendorsListPage } from './features/vendors/pages/VendorsListPage'
import { CategoriesListPage } from './features/categories/pages/CategoriesListPage'
import { BookingsListPage } from './features/bookings/pages/BookingsListPage'

function App() {
  return (
    <AppProviders>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <OverviewPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/vendors"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <VendorsListPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <CategoriesListPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <BookingsListPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProviders>
  )
}

export default App
