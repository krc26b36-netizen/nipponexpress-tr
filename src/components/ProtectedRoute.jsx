import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

// role: 'user' | 'admin' — giriş yoksa /giris'e, yanlış rolse kendi paneline yönlendir
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-edge border-t-shu animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/giris" state={{ from: location.pathname }} replace />
  }

  if (role && user.role !== role) {
    const dest = user.role === 'admin' ? '/admin' : '/panel'
    return <Navigate to={dest} replace />
  }

  return children
}
