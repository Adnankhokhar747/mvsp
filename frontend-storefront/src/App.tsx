import { Route, Routes } from 'react-router-dom'
import { AppProviders } from './app/providers/AppProviders'
import { StorefrontLayout } from './app/layouts/StorefrontLayout'
import { HomePage } from './features/categories/pages/HomePage'
import { ServicesListPage } from './features/services/pages/ServicesListPage'
import { ServiceDetailPage } from './features/services/pages/ServiceDetailPage'
import { VendorProfilePage } from './features/vendors/pages/VendorProfilePage'

function App() {
  return (
    <AppProviders>
      <StorefrontLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesListPage />} />
          <Route path="/services/:id" element={<ServiceDetailPage />} />
          <Route path="/vendors/:slug" element={<VendorProfilePage />} />
        </Routes>
      </StorefrontLayout>
    </AppProviders>
  )
}

export default App
