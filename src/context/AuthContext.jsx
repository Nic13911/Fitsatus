import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const registrarUsuario = (email, password) => supabase.auth.signUp({ email, password })

  const iniciarSesion = (email, password) => supabase.auth.signInWithPassword({ email, password })

  const cerrarSesion = () => supabase.auth.signOut()

  const value = {
    session,
    usuario: session?.user ?? null,
    loading,
    registrarUsuario,
    iniciarSesion,
    cerrarSesion
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
