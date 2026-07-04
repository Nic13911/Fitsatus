import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { generarPlanAlimenticio } from '../lib/business'
import { Header, Card, Button, Field, inputClass, Alert } from '../components/UI'

function hoyISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function Alimentacion() {
  const { usuario } = useAuth()
  const [plan, setPlan] = useState(null)
  const [objetivo, setObjetivo] = useState(null)
  const [registroHoy, setRegistroHoy] = useState(null)
  const [alimentos, setAlimentos] = useState([])
  const [nombreAlimento, setNombreAlimento] = useState('')
  const [caloriasAlimento, setCaloriasAlimento] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  async function cargarTodo() {
    const { data: objetivoData } = await supabase
      .from('objetivos')
      .select('*')
      .eq('usuario_id', usuario.id)
      .order('fecha_inicio', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: planData } = await supabase
      .from('planes_alimenticios')
      .select('*')
      .eq('usuario_id', usuario.id)
      .order('fecha_generacion', { ascending: false })
      .limit(1)
      .maybeSingle()

    let { data: registro } = await supabase
      .from('registros_diarios')
      .select('*')
      .eq('usuario_id', usuario.id)
      .eq('fecha', hoyISO())
      .maybeSingle()

    if (!registro) {
      const { data: nuevoRegistro } = await supabase
        .from('registros_diarios')
        .insert({ usuario_id: usuario.id, fecha: hoyISO(), total_calorias: 0 })
        .select()
        .single()
      registro = nuevoRegistro
    }

    const { data: alimentosData } = await supabase
      .from('alimentos_registrados')
      .select('*')
      .eq('registro_id', registro.id)
      .order('created_at', { ascending: true })

    setObjetivo(objetivoData)
    setPlan(planData)
    setRegistroHoy(registro)
    setAlimentos(alimentosData ?? [])
    setCargando(false)
  }

  useEffect(() => {
    cargarTodo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario.id])

  async function regenerarPlan() {
    if (!objetivo) return
    setError(null)
    setMensaje(null)
    const nuevoPlan = generarPlanAlimenticio({ tdee: objetivo.tdee, tipoObjetivo: objetivo.tipo_objetivo })
    if (!nuevoPlan) {
      setError('Necesitas completar tu perfil y objetivo antes de generar un plan alimenticio.')
      return
    }
    const { error: insertError } = await supabase.from('planes_alimenticios').insert({
      usuario_id: usuario.id,
      calorias_objetivo: nuevoPlan.caloriasObjetivo,
      distribucion_macros: nuevoPlan.distribucionMacros,
      sugerencias: nuevoPlan.sugerencias,
      fecha_generacion: nuevoPlan.fechaGeneracion
    })
    if (insertError) {
      console.error(insertError)
      setError('No se pudo generar el plan: ' + insertError.message)
      return
    }
    await cargarTodo()
    setMensaje('¡Plan actualizado!')
    setTimeout(() => setMensaje(null), 3000)
  }

  async function agregarAlimento(e) {
    e.preventDefault()
    const calorias = Number(caloriasAlimento)
    if (!nombreAlimento.trim() || !(calorias > 0)) return

    await supabase.from('alimentos_registrados').insert({
      registro_id: registroHoy.id,
      nombre: nombreAlimento.trim(),
      calorias
    })

    const nuevoTotal = (registroHoy.total_calorias ?? 0) + calorias
    await supabase.from('registros_diarios').update({ total_calorias: nuevoTotal }).eq('id', registroHoy.id)

    setNombreAlimento('')
    setCaloriasAlimento('')
    await cargarTodo()
  }

  if (cargando) return <div className="p-8 text-center text-ink/60 text-sm">Cargando tu alimentación…</div>

  const totalHoy = registroHoy?.total_calorias ?? 0
  const objetivoCalorico = plan?.calorias_objetivo ?? 0
  const porcentaje = objetivoCalorico ? Math.min(100, Math.round((totalHoy / objetivoCalorico) * 100)) : 0

  return (
    <div className="min-h-full">
      <Header eyebrow="Nutrición" title="Plan alimenticio" subtitle="Objetivo calórico y registro diario" />

      <div className="px-6 -mt-4 space-y-4">
        {error && <Alert tone="error">{error}</Alert>}
        {mensaje && <Alert tone="success">{mensaje}</Alert>}
        <Card>
          <p className="text-3xl font-display font-bold text-ink-dark">{objetivoCalorico} kcal</p>
          <p className="text-xs text-ink-dark/60 mb-3">Objetivo calórico diario</p>
          {plan?.distribucion_macros && (
            <div className="flex gap-3 text-xs text-ink-dark/70">
              <span>Proteína: {plan.distribucion_macros.proteinaG} g</span>
              <span>Carbs: {plan.distribucion_macros.carbohidratosG} g</span>
              <span>Grasas: {plan.distribucion_macros.grasasG} g</span>
            </div>
          )}
          <ul className="mt-3 text-sm text-ink-dark/80 list-disc pl-4 space-y-1">
            {plan?.sugerencias?.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          <Button variant="outline" className="mt-4" onClick={regenerarPlan}>
            Regenerar plan alimenticio
          </Button>
        </Card>

        <Card>
          <p className="font-semibold text-sm text-ink-dark mb-2">Registro de hoy</p>
          <div className="w-full h-2 bg-paper rounded-full overflow-hidden mb-2 border border-line">
            <div className="h-full bg-amber" style={{ width: `${porcentaje}%` }} />
          </div>
          <p className="text-xs text-ink-dark/60 mb-3">
            {totalHoy} / {objetivoCalorico} kcal consumidas
          </p>

          <form onSubmit={agregarAlimento} className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <Field label="Alimento" className="w-full sm:flex-1 sm:min-w-0">
              <input
                className={inputClass}
                value={nombreAlimento}
                onChange={(e) => setNombreAlimento(e.target.value)}
                placeholder="Ej: Ensalada de pollo"
              />
            </Field>
            <Field label="Kcal" className="w-full sm:w-20 sm:shrink-0">
              <input
                type="number"
                min="1"
                className={inputClass}
                value={caloriasAlimento}
                onChange={(e) => setCaloriasAlimento(e.target.value)}
                placeholder="350"
              />
            </Field>
            <Button variant="accent" type="submit" className="w-full sm:w-auto sm:px-4 sm:mb-4 shrink-0">
              Agregar
            </Button>
          </form>

          <ul className="mt-2 divide-y divide-line">
            {alimentos.map((a) => (
              <li key={a.id} className="py-2 flex justify-between text-sm">
                <span className="text-ink-dark">{a.nombre}</span>
                <span className="text-ink-dark/60">{a.calorias} kcal</span>
              </li>
            ))}
            {alimentos.length === 0 && <p className="text-xs text-ink-dark/50 py-2">Aún no registras alimentos hoy.</p>}
          </ul>
        </Card>
      </div>

      <div className="h-4" />
      
    </div>
  )
}
