import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Field, inputClass, Alert } from '../components/UI'

export default function Login() {
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setCargando(true)
    const { error } = await iniciarSesion(email, password)
    setCargando(false)
    if (error) {
      setError('No pudimos iniciar sesión. Revisa tu correo y contraseña.')
      return
    }
    navigate('/')
  }

  return (
    <div className="px-6 sm:px-8 py-10">
      <p className="text-amber font-semibold text-xs tracking-[0.2em] uppercase mb-2">FitSatus</p>
      <h1 className="font-display text-3xl font-bold text-ink-dark mb-1">Bienvenido de vuelta</h1>
      <p className="text-sm text-ink-dark/60 mb-6">Inicia sesión para seguir tu plan.</p>

      {error && <Alert>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Field label="Correo electrónico">
          <input
            type="email"
            required
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
          />
        </Field>
        <Field label="Contraseña">
          <input
            type="password"
            required
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        <Button type="submit" variant="accent" disabled={cargando}>
          {cargando ? 'Ingresando…' : 'Iniciar sesión'}
        </Button>
      </form>

      <p className="text-sm text-center text-ink-dark/60 mt-6">
        ¿Aún no tienes cuenta?{' '}
        <Link to="/registro" className="text-ink font-semibold underline">
          Regístrate
        </Link>
      </p>
    </div>
  )
}
