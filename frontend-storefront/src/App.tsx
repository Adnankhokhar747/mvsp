import { Route, Routes } from 'react-router-dom'
import { AppProviders } from './app/providers/AppProviders'
import { StorefrontLayout } from './app/layouts/StorefrontLayout'
import { ProtectedRoute } from './app/router/ProtectedRoute'
import { HomePage } from './features/categories/pages/HomePage'
import { ServicesListPage } from './features/services/pages/ServicesListPage'
import { ServiceDetailPage } from './features/services/pages/ServiceDetailPage'
import { VendorProfilePage } from './features/vendors/pages/VendorProfilePage'
import { LoginPage } from './features/auth/pages/LoginPage'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { VerifyEmailPage } from './features/auth/pages/VerifyEmailPage'
import { AccountPage } from './features/account/pages/AccountPage'
import { BookingCreatePage } from './features/bookings/pages/BookingCreatePage'
import { MyBookingsPage } from './features/bookings/pages/MyBookingsPage'
import { BookingDetailPage } from './features/bookings/pages/BookingDetailPage'
import { ConversationsListPage } from './features/messaging/pages/ConversationsListPage'
import { ConversationThreadPage } from './features/messaging/pages/ConversationThreadPage'
import { NewConversationPage } from './features/messaging/pages/NewConversationPage'

function App() {
  return (
    <AppProviders>
      <StorefrontLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesListPage />} />
          <Route path="/services/:id" element={<ServiceDetailPage />} />
          <Route path="/vendors/:slug" element={<VendorProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services/:id/book"
            element={
              <ProtectedRoute>
                <BookingCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
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
            path="/vendors/:slug/message"
            element={
              <ProtectedRoute>
                <NewConversationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <ConversationsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:id"
            element={
              <ProtectedRoute>
                <ConversationThreadPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </StorefrontLayout>
    </AppProviders>
  )
}

export default App
