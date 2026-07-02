import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { usuario, loading } = useAuth()

  if (loading) {
    return <div className="p-8 text-center text-ink/60 text-sm">Cargando FitSatus…</div>
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return children
}
