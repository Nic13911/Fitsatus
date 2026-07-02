import { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { calcularIMC, clasificarIMC } from '../lib/business'
import { Header, Card } from '../components/UI'
import { Flame, Ruler, Target } from 'lucide-react'

export default function Dashboard() {
  const { usuario } = useAuth()
  const [perfil, setPerfil] = useState(null)
  const [objetivo, setObjetivo] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data: perfilData } = await supabase.from('perfiles').select('*').eq('id', usuario.id).maybeSingle()
      const { data: objetivoData } = await supabase
        .from('objetivos')
        .select('*')
        .eq('usuario_id', usuario.id)
        .order('fecha_inicio', { ascending: false })
        .limit(1)
        .maybeSingle()
      setPerfil(perfilData)
      setObjetivo(objetivoData)
      setCargando(false)
    }
    cargar()
  }, [usuario.id])

  if (cargando) return <div className="p-8 text-center text-ink/60 text-sm">Cargando tu resumen…</div>
  if (!perfil) return <Navigate to="/onboarding" replace />

  const imc = calcularIMC(perfil.peso, perfil.estatura)

  return (
    <div className="min-h-full">
      <Header eyebrow="Hola de nuevo" title="Tu resumen de hoy" subtitle="Así va tu progreso con FitSatus." />

      <div className="px-6 -mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center">
            <Ruler className="mx-auto text-ink mb-1" size={20} />
            <p className="text-2xl font-display font-bold text-ink-dark">{imc ?? '—'}</p>
            <p className="text-xs text-ink-dark/60">IMC · {clasificarIMC(imc)}</p>
          </Card>
          <Card className="text-center">
            <Flame className="mx-auto text-coral mb-1" size={20} />
            <p className="text-2xl font-display font-bold text-ink-dark">{objetivo?.tdee ?? '—'}</p>
            <p className="text-xs text-ink-dark/60">kcal / día (TDEE)</p>
          </Card>
        </div>

        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Target size={18} className="text-amber-dark" />
            <p className="font-semibold text-sm text-ink-dark">Tu objetivo actual</p>
          </div>
          <p className="text-sm text-ink-dark/70">
            {objetivo?.tipo_objetivo === 'bajar_peso' && 'Bajar de peso'}
            {objetivo?.tipo_objetivo === 'ganar_musculo' && 'Aumentar masa muscular'}
            {objetivo?.tipo_objetivo === 'mantenimiento' && 'Mantenerte en tu peso actual'}
            {objetivo?.meta_peso ? ` · meta: ${objetivo.meta_peso} kg` : ''}
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Link to="/entrenamiento">
            <Card className="hover:border-amber transition-colors">
              <p className="font-semibold text-sm text-ink-dark">Plan de entrenamiento</p>
              <p className="text-xs text-ink-dark/60 mt-1">Ver rutina de la semana</p>
            </Card>
          </Link>
          <Link to="/alimentacion">
            <Card className="hover:border-amber transition-colors">
              <p className="font-semibold text-sm text-ink-dark">Plan alimenticio</p>
              <p className="text-xs text-ink-dark/60 mt-1">Ver calorías y comidas</p>
            </Card>
          </Link>
        </div>
      </div>

      
    </div>
  )
}
