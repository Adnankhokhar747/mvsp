import { Navigate, Route, Routes } from 'react-router-dom'
import { AppProviders } from './app/providers/AppProviders'
import { ProtectedRoute } from './app/router/ProtectedRoute'
import { AdminLayout } from './app/layouts/AdminLayout'
import { LoginPage } from './features/auth/pages/LoginPage'
import { OverviewPage } from './features/overview/pages/OverviewPage'
import { VendorsListPage } from './features/vendors/pages/VendorsListPage'
import { CategoriesListPage } from './features/categories/pages/CategoriesListPage'
import { BookingsListPage } from './features/bookings/pages/BookingsListPage'
import { PaymentsListPage } from './features/payments/pages/PaymentsListPage'
import { SettingsPage } from './features/settings/pages/SettingsPage'
import { PayoutsListPage } from './features/payouts/pages/PayoutsListPage'
import { PlansPage } from './features/plans/pages/PlansPage'
import { ReviewsListPage } from './features/reviews/pages/ReviewsListPage'
import { ActivityLogPage } from './features/activity-logs/pages/ActivityLogPage'
import { StaffListPage } from './features/staff/pages/StaffListPage'

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

        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <PaymentsListPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <SettingsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/payouts"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <PayoutsListPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/plans"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <PlansPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ReviewsListPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/activity-logs"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ActivityLogPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <StaffListPage />
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
