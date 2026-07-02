import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { calcularTDEE } from '../lib/business'
import { Header, Card, Button, Field, inputClass, Alert } from '../components/UI'

const TIPOS = [
  { value: 'entrenamiento', label: 'Entrenamiento' },
  { value: 'alimentacion', label: 'Alimentación' }
]

export default function Ajustes() {
  const { usuario, cerrarSesion } = useAuth()
  const [recordatorios, setRecordatorios] = useState([])
  const [tipo, setTipo] = useState('entrenamiento')
  const [hora, setHora] = useState('08:00')

  const [objetivoId, setObjetivoId] = useState(null)
  const [perfilForm, setPerfilForm] = useState(null)
  const [guardandoPerfil, setGuardandoPerfil] = useState(false)
  const [mensajePerfil, setMensajePerfil] = useState(null)
  const [errorPerfil, setErrorPerfil] = useState(null)

  async function cargar() {
    const { data } = await supabase.from('recordatorios').select('*').eq('usuario_id', usuario.id)
    setRecordatorios(data ?? [])
  }

  async function cargarPerfil() {
    const { data: perfil } = await supabase.from('perfiles').select('*').eq('id', usuario.id).maybeSingle()
    const { data: objetivo } = await supabase
      .from('objetivos')
      .select('*')
      .eq('usuario_id', usuario.id)
      .order('fecha_inicio', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (perfil) {
      setObjetivoId(objetivo?.id ?? null)
      setPerfilForm({
        peso: perfil.peso ?? '',
        estatura: perfil.estatura ?? '',
        edad: perfil.edad ?? '',
        sexo: perfil.sexo ?? 'otro',
        nivelActividad: perfil.nivel_actividad ?? 'moderado',
        nivelExperiencia: perfil.nivel_experiencia ?? 'principiante',
        tipoObjetivo: objetivo?.tipo_objetivo ?? 'mantenimiento',
        metaPeso: objetivo?.meta_peso ?? ''
      })
    }
  }

  useEffect(() => {
    cargar()
    cargarPerfil()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario.id])

  function updatePerfil(campo, valor) {
    setPerfilForm((prev) => ({ ...prev, [campo]: valor }))
  }

  async function guardarPerfil(e) {
    e.preventDefault()
    setErrorPerfil(null)
    setMensajePerfil(null)

    const peso = Number(perfilForm.peso)
    const estatura = Number(perfilForm.estatura)
    const edad = Number(perfilForm.edad)
    const metaPeso = perfilForm.metaPeso ? Number(perfilForm.metaPeso) : null

    if (!(peso > 0) || !(estatura > 0) || !(edad > 0)) {
      setErrorPerfil('Peso, estatura y edad deben ser valores numéricos positivos.')
      return
    }

    setGuardandoPerfil(true)

    const { error: perfilError } = await supabase
      .from('perfiles')
      .update({
        peso,
        estatura,
        edad,
        sexo: perfilForm.sexo,
        nivel_actividad: perfilForm.nivelActividad,
        nivel_experiencia: perfilForm.nivelExperiencia
      })
      .eq('id', usuario.id)

    const tdee = calcularTDEE({
      pesoKg: peso,
      estaturaCm: estatura,
      edad,
      sexo: perfilForm.sexo,
      nivelActividad: perfilForm.nivelActividad
    })

    let objetivoError = null
    if (objetivoId) {
      const { error } = await supabase
        .from('objetivos')
        .update({ tipo_objetivo: perfilForm.tipoObjetivo, meta_peso: metaPeso, tdee })
        .eq('id', objetivoId)
      objetivoError = error
    } else {
      const { error } = await supabase.from('objetivos').insert({
        usuario_id: usuario.id,
        tipo_objetivo: perfilForm.tipoObjetivo,
        meta_peso: metaPeso,
        fecha_inicio: new Date().toISOString().slice(0, 10),
        tdee
      })
      objetivoError = error
    }

    setGuardandoPerfil(false)

    if (perfilError || objetivoError) {
      console.error(perfilError || objetivoError)
      setErrorPerfil('No se pudieron guardar los cambios. Intenta nuevamente.')
      return
    }

    setMensajePerfil('¡Datos actualizados!')
    setTimeout(() => setMensajePerfil(null), 3000)
    await cargarPerfil()
  }

  async function agregarRecordatorio(e) {
    e.preventDefault()
    if (Notification && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
    await supabase.from('recordatorios').insert({ usuario_id: usuario.id, tipo, hora, activo: true })
    await cargar()
  }

  async function alternarActivo(recordatorio) {
    await supabase.from('recordatorios').update({ activo: !recordatorio.activo }).eq('id', recordatorio.id)
    await cargar()
  }

  return (
    <div className="min-h-full">
      <Header eyebrow="Configuración" title="Ajustes" subtitle="Recordatorios y cuenta" />

      <div className="px-6 -mt-4 space-y-4">
        <Card>
          <p className="font-semibold text-sm text-ink-dark mb-3">Mi perfil</p>

          {errorPerfil && <Alert tone="error">{errorPerfil}</Alert>}
          {mensajePerfil && <Alert tone="success">{mensajePerfil}</Alert>}

          {!perfilForm ? (
            <p className="text-xs text-ink-dark/50">Cargando tus datos…</p>
          ) : (
            <form onSubmit={guardarPerfil}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Peso (kg)">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    className={inputClass}
                    value={perfilForm.peso}
                    onChange={(e) => updatePerfil('peso', e.target.value)}
                  />
                </Field>
                <Field label="Estatura (cm)">
                  <input
                    type="number"
                    min="1"
                    className={inputClass}
                    value={perfilForm.estatura}
                    onChange={(e) => updatePerfil('estatura', e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Edad">
                  <input
                    type="number"
                    min="1"
                    className={inputClass}
                    value={perfilForm.edad}
                    onChange={(e) => updatePerfil('edad', e.target.value)}
                  />
                </Field>
                <Field label="Sexo">
                  <select
                    className={inputClass}
                    value={perfilForm.sexo}
                    onChange={(e) => updatePerfil('sexo', e.target.value)}
                  >
                    <option value="femenino">Femenino</option>
                    <option value="masculino">Masculino</option>
                    <option value="otro">Prefiero no decirlo</option>
                  </select>
                </Field>
              </div>

              <Field label="Nivel de experiencia">
                <select
                  className={inputClass}
                  value={perfilForm.nivelExperiencia}
                  onChange={(e) => updatePerfil('nivelExperiencia', e.target.value)}
                >
                  <option value="principiante">Principiante</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="experimentado">Experimentado</option>
                </select>
              </Field>

              <Field label="Nivel de actividad diaria">
                <select
                  className={inputClass}
                  value={perfilForm.nivelActividad}
                  onChange={(e) => updatePerfil('nivelActividad', e.target.value)}
                >
                  <option value="sedentario">Sedentario</option>
                  <option value="ligero">Ligero</option>
                  <option value="moderado">Moderado</option>
                  <option value="activo">Activo</option>
                </select>
              </Field>

              <Field label="Objetivo">
                <select
                  className={inputClass}
                  value={perfilForm.tipoObjetivo}
                  onChange={(e) => updatePerfil('tipoObjetivo', e.target.value)}
                >
                  <option value="bajar_peso">Bajar de peso</option>
                  <option value="ganar_musculo">Aumentar masa muscular</option>
                  <option value="mantenimiento">Mantenerme</option>
                </select>
              </Field>

              <Field label="Meta de peso (kg) — opcional">
                <input
                  type="number"
                  step="0.1"
                  className={inputClass}
                  value={perfilForm.metaPeso}
                  onChange={(e) => updatePerfil('metaPeso', e.target.value)}
                />
              </Field>

              <Button variant="accent" type="submit" disabled={guardandoPerfil}>
                {guardandoPerfil ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </form>
          )}
          <p className="text-[11px] text-ink-dark/40 mt-3">
            Correo de la cuenta: {usuario.email}. Cambiar el email o la contraseña no está incluido en este MVP.
          </p>
        </Card>

        <Card>
          <p className="font-semibold text-sm text-ink-dark mb-2">Recordatorios</p>
          <form onSubmit={agregarRecordatorio} className="flex gap-2 items-end mb-3">
            <Field label="Tipo" className="flex-1 min-w-0">
              <select className={inputClass} value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Hora" className="w-28 shrink-0">
              <input type="time" className={inputClass} value={hora} onChange={(e) => setHora(e.target.value)} />
            </Field>
            <Button variant="accent" type="submit" className="w-auto px-4 mb-4 shrink-0">
              Añadir
            </Button>
          </form>

          <ul className="divide-y divide-line">
            {recordatorios.map((r) => (
              <li key={r.id} className="py-2 flex items-center justify-between text-sm">
                <span className="text-ink-dark">
                  {TIPOS.find((t) => t.value === r.tipo)?.label} · {r.hora?.slice(0, 5)}
                </span>
                <button
                  onClick={() => alternarActivo(r)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    r.activo ? 'bg-ink text-paper' : 'bg-paper border border-line text-ink-dark/60'
                  }`}
                >
                  {r.activo ? 'Activo' : 'Inactivo'}
                </button>
              </li>
            ))}
            {recordatorios.length === 0 && (
              <p className="text-xs text-ink-dark/50 py-2">Aún no configuras recordatorios.</p>
            )}
          </ul>
          <p className="text-[11px] text-ink-dark/40 mt-2">
            Nota MVP: las notificaciones usan el permiso del navegador; en la versión productiva se recomienda
            notificaciones push nativas.
          </p>
        </Card>

        <Button variant="outline" onClick={cerrarSesion}>
          Cerrar sesión
        </Button>
      </div>

      <div className="h-4" />
      
    </div>
  )
}
