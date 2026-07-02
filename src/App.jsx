import { Routes, Route } from 'react-router-dom'
import AuthLayout from './components/AuthLayout'
import AppShell from './components/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Entrenamiento from './pages/Entrenamiento'
import Alimentacion from './pages/Alimentacion'
import Progreso from './pages/Progreso'
import Logros from './pages/Logros'
import Ajustes from './pages/Ajustes'

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        }
      />
      <Route
        path="/registro"
        element={
          <AuthLayout>
            <Register />
          </AuthLayout>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <AppShell>
              <Onboarding />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell>
              <Dashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/entrenamiento"
        element={
          <ProtectedRoute>
            <AppShell>
              <Entrenamiento />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/alimentacion"
        element={
          <ProtectedRoute>
            <AppShell>
              <Alimentacion />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/progreso"
        element={
          <ProtectedRoute>
            <AppShell>
              <Progreso />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/logros"
        element={
          <ProtectedRoute>
            <AppShell>
              <Logros />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ajustes"
        element={
          <ProtectedRoute>
            <AppShell>
              <Ajustes />
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
