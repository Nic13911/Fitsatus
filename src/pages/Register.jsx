import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Field, inputClass, Alert } from '../components/UI'

export default function Register() {
  const { registrarUsuario } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (password !== confirmacion) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setCargando(true)
    const { error, data } = await registrarUsuario(email, password)
    setCargando(false)

    if (error) {
      setError(error.message)
      return
    }

    if (data.session) {
      navigate('/onboarding')
    } else {
      setError('Revisa tu correo para confirmar la cuenta y luego inicia sesión.')
    }
  }

  return (
    <div className="min-h-full flex flex-col justify-center px-6 py-10">
      <p className="text-amber font-semibold text-xs tracking-[0.2em] uppercase mb-2">FitSatus</p>
      <h1 className="font-display text-3xl font-bold text-ink-dark mb-1">Crea tu cuenta</h1>
      <p className="text-sm text-ink-dark/60 mb-6">
        Regístrate para acceder a funcionalidades personalizadas y almacenar tu información.
      </p>

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
            placeholder="Mínimo 6 caracteres"
          />
        </Field>
        <Field label="Confirmar contraseña">
          <input
            type="password"
            required
            className={inputClass}
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            placeholder="Repite tu contraseña"
          />
        </Field>
        <Button type="submit" variant="accent" disabled={cargando}>
          {cargando ? 'Creando cuenta…' : 'Registrarme'}
        </Button>
      </form>

      <p className="text-sm text-center text-ink-dark/60 mt-6">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-ink font-semibold underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
