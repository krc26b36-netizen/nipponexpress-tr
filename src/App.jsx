import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import CustomerLayout from './layouts/CustomerLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'

const Landing = lazy(() => import('./pages/Landing.jsx'))
const Auth = lazy(() => import('./pages/Auth.jsx'))
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard.jsx'))
const CustomerTicket = lazy(() => import('./pages/CustomerTicket.jsx'))
const NewTicket = lazy(() => import('./pages/NewTicket.jsx'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-edge border-t-shu animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/giris" element={<Auth />} />

        {/* Customer panel */}
        <Route
          path="/panel"
          element={
            <ProtectedRoute role="user">
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CustomerDashboard />} />
          <Route path="talep/:id" element={<CustomerTicket />} />
          <Route path="yeni" element={<NewTicket />} />
        </Route>

        {/* Admin panel */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
