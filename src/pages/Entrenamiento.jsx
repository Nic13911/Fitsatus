import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { generarPlanEntrenamiento } from '../lib/business'
import { EJERCICIOS } from '../data/ejerciciosCatalogo'
import { Header, Card, Button } from '../components/UI'
import { CheckCircle2, Circle } from 'lucide-react'

export default function Entrenamiento() {
  const { usuario } = useAuth()
  const [plan, setPlan] = useState(null)
  const [objetivo, setObjetivo] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [regenerando, setRegenerando] = useState(false)
  const [ejercicioAbierto, setEjercicioAbierto] = useState(null)

  async function cargarPlan() {
    const { data: perfilData } = await supabase.from('perfiles').select('*').eq('id', usuario.id).maybeSingle()
    const { data: objetivoData } = await supabase
      .from('objetivos')
      .select('*')
      .eq('usuario_id', usuario.id)
      .order('fecha_inicio', { ascending: false })
      .limit(1)
      .maybeSingle()
    const { data: planData } = await supabase
      .from('planes_entrenamiento')
      .select('*')
      .eq('usuario_id', usuario.id)
      .order('fecha_generacion', { ascending: false })
      .limit(1)
      .maybeSingle()

    setPerfil(perfilData)
    setObjetivo(objetivoData)
    setPlan(planData)
    setCargando(false)
  }

  useEffect(() => {
    cargarPlan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario.id])

  async function regenerarPlan() {
    if (!perfil || !objetivo) return
    setRegenerando(true)
    const nuevoPlan = generarPlanEntrenamiento({
      tipoObjetivo: objetivo.tipo_objetivo,
      nivelExperiencia: perfil.nivel_experiencia
    })
    await supabase.from('planes_entrenamiento').insert({
      usuario_id: usuario.id,
      objetivo_id: objetivo.id,
      nivel_dificultad: nuevoPlan.nivelDificultad,
      frecuencia_semanal: nuevoPlan.frecuenciaSemanal,
      contenido: nuevoPlan.contenido,
      fecha_generacion: nuevoPlan.fechaGeneracion
    })
    await cargarPlan()
    setRegenerando(false)
  }

  async function marcarCumplido(index) {
    const contenidoActualizado = plan.contenido.map((sesion, i) =>
      i === index ? { ...sesion, completado: !sesion.completado } : sesion
    )
    setPlan({ ...plan, contenido: contenidoActualizado })
    await supabase.from('planes_entrenamiento').update({ contenido: contenidoActualizado }).eq('id', plan.id)
  }

  if (cargando) return <div className="p-8 text-center text-ink/60 text-sm">Cargando tu plan…</div>

  return (
    <div className="min-h-full">
      <Header eyebrow="Tu rutina" title="Plan de entrenamiento" subtitle={`Nivel: ${plan?.nivel_dificultad ?? '—'}`} />

      <div className="px-6 -mt-4 space-y-3">
        {plan?.contenido?.map((sesion, i) => (
          <Card key={i}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm text-ink-dark">
                  {sesion.dia} · {sesion.foco}
                </p>
                <p className="text-xs text-ink-dark/60 mt-0.5">
                  {sesion.series} series × {sesion.repeticiones} reps · descanso {sesion.descanso}
                </p>
              </div>
              <button onClick={() => marcarCumplido(i)} aria-label="Marcar sesión cumplida">
                {sesion.completado ? (
                  <CheckCircle2 className="text-ink" size={22} />
                ) : (
                  <Circle className="text-ink/30" size={22} />
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {sesion.ejercicios.map((codigo) => (
                <button
                  key={codigo}
                  onClick={() => setEjercicioAbierto(ejercicioAbierto === codigo ? null : codigo)}
                  className="text-xs px-2.5 py-1 rounded-full bg-paper border border-line text-ink-dark hover:border-amber"
                >
                  {EJERCICIOS[codigo]?.nombre ?? codigo}
                </button>
              ))}
            </div>

            {sesion.ejercicios
              .filter((codigo) => codigo === ejercicioAbierto)
              .map((codigo) => (
                <div key={codigo} className="mt-3 text-xs text-ink-dark/70 bg-paper rounded-lg p-3 border border-line">
                  <p className="font-semibold text-ink-dark mb-1">
                    {EJERCICIOS[codigo].nombre} · {EJERCICIOS[codigo].grupoMuscular}
                  </p>
                  <p>{EJERCICIOS[codigo].descripcion}</p>
                </div>
              ))}
          </Card>
        ))}

        <Button variant="outline" onClick={regenerarPlan} disabled={regenerando}>
          {regenerando ? 'Generando…' : 'Regenerar plan de entrenamiento'}
        </Button>
      </div>

      <div className="h-4" />
      
    </div>
  )
}
