import { Routes, Route } from 'react-router-dom'
import MobileFrame from './components/MobileFrame'
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
    <MobileFrame>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/entrenamiento"
          element={
            <ProtectedRoute>
              <Entrenamiento />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alimentacion"
          element={
            <ProtectedRoute>
              <Alimentacion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progreso"
          element={
            <ProtectedRoute>
              <Progreso />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logros"
          element={
            <ProtectedRoute>
              <Logros />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ajustes"
          element={
            <ProtectedRoute>
              <Ajustes />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MobileFrame>
  )
}
