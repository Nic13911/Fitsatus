import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { calcularTDEE, generarPlanEntrenamiento, generarPlanAlimenticio } from '../lib/business'
import { Button, Field, inputClass, Alert, Header } from '../components/UI'

const OBJETIVOS = [
  { value: 'bajar_peso', label: 'Bajar de peso' },
  { value: 'ganar_musculo', label: 'Aumentar masa muscular' },
  { value: 'mantenimiento', label: 'Mantenerme' }
]

export default function Onboarding() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    peso: '',
    estatura: '',
    edad: '',
    sexo: 'otro',
    nivelActividad: 'moderado',
    nivelExperiencia: 'principiante',
    tipoObjetivo: 'mantenimiento',
    metaPeso: ''
  })
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const peso = Number(form.peso)
    const estatura = Number(form.estatura)
    const edad = Number(form.edad)
    const metaPeso = form.metaPeso ? Number(form.metaPeso) : null

    if (!(peso > 0) || !(estatura > 0) || !(edad > 0)) {
      setError('Ingresa peso, estatura y edad como valores numéricos positivos.')
      return
    }

    setCargando(true)
    try {
      // 1. Guardar perfil (Ingreso de datos personales)
      const { error: perfilError } = await supabase.from('perfiles').upsert({
        id: usuario.id,
        peso,
        estatura,
        edad,
        sexo: form.sexo,
        nivel_actividad: form.nivelActividad,
        nivel_experiencia: form.nivelExperiencia
      })
      if (perfilError) throw perfilError

      // 2. Calcular TDEE y guardar objetivo (Definición de objetivos)
      const tdee = calcularTDEE({ pesoKg: peso, estaturaCm: estatura, edad, sexo: form.sexo, nivelActividad: form.nivelActividad })

      const { data: objetivo, error: objetivoError } = await supabase
        .from('objetivos')
        .insert({
          usuario_id: usuario.id,
          tipo_objetivo: form.tipoObjetivo,
          meta_peso: metaPeso,
          fecha_inicio: new Date().toISOString().slice(0, 10),
          tdee
        })
        .select()
        .single()
      if (objetivoError) throw objetivoError

      // 3. Generar plan de entrenamiento inicial (Generación de plan de entrenamiento)
      const planEntrenamiento = generarPlanEntrenamiento({
        tipoObjetivo: form.tipoObjetivo,
        nivelExperiencia: form.nivelExperiencia
      })
      const { error: planEntError } = await supabase.from('planes_entrenamiento').insert({
        usuario_id: usuario.id,
        objetivo_id: objetivo.id,
        nivel_dificultad: planEntrenamiento.nivelDificultad,
        frecuencia_semanal: planEntrenamiento.frecuenciaSemanal,
        contenido: planEntrenamiento.contenido,
        fecha_generacion: planEntrenamiento.fechaGeneracion
      })
      if (planEntError) throw planEntError

      // 4. Generar plan alimenticio inicial (Generación de plan alimenticio)
      const planAlimenticio = generarPlanAlimenticio({ tdee, tipoObjetivo: form.tipoObjetivo })
      const { error: planAlimError } = await supabase.from('planes_alimenticios').insert({
        usuario_id: usuario.id,
        calorias_objetivo: planAlimenticio.caloriasObjetivo,
        distribucion_macros: planAlimenticio.distribucionMacros,
        sugerencias: planAlimenticio.sugerencias,
        fecha_generacion: planAlimenticio.fechaGeneracion
      })
      if (planAlimError) throw planAlimError

      // 5. Registrar el peso inicial como primer punto de progreso
      await supabase.from('progreso').insert({
        usuario_id: usuario.id,
        fecha: new Date().toISOString().slice(0, 10),
        peso
      })

      navigate('/')
    } catch (err) {
      console.error(err)
      setError('Ocurrió un problema al guardar tu información. Intenta nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-full pb-10">
      <Header
        eyebrow="Paso 1 de 1"
        title="Cuéntanos de ti"
        subtitle="Con esto generamos tu plan de entrenamiento y alimentación."
      />
      <form onSubmit={handleSubmit} className="px-6 pt-6">
        {error && <Alert>{error}</Alert>}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Peso (kg)">
            <input
              type="number"
              step="0.1"
              min="1"
              required
              className={inputClass}
              value={form.peso}
              onChange={(e) => update('peso', e.target.value)}
            />
          </Field>
          <Field label="Estatura (cm)">
            <input
              type="number"
              min="1"
              required
              className={inputClass}
              value={form.estatura}
              onChange={(e) => update('estatura', e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Edad">
            <input
              type="number"
              min="1"
              required
              className={inputClass}
              value={form.edad}
              onChange={(e) => update('edad', e.target.value)}
            />
          </Field>
          <Field label="Sexo">
            <select className={inputClass} value={form.sexo} onChange={(e) => update('sexo', e.target.value)}>
              <option value="femenino">Femenino</option>
              <option value="masculino">Masculino</option>
              <option value="otro">Prefiero no decirlo</option>
            </select>
          </Field>
        </div>

        <Field label="Nivel de experiencia">
          <select
            className={inputClass}
            value={form.nivelExperiencia}
            onChange={(e) => update('nivelExperiencia', e.target.value)}
          >
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="experimentado">Experimentado</option>
          </select>
        </Field>

        <Field label="Nivel de actividad diaria">
          <select
            className={inputClass}
            value={form.nivelActividad}
            onChange={(e) => update('nivelActividad', e.target.value)}
          >
            <option value="sedentario">Sedentario</option>
            <option value="ligero">Ligero</option>
            <option value="moderado">Moderado</option>
            <option value="activo">Activo</option>
          </select>
        </Field>

        <Field label="¿Cuál es tu objetivo?">
          <select
            className={inputClass}
            value={form.tipoObjetivo}
            onChange={(e) => update('tipoObjetivo', e.target.value)}
          >
            {OBJETIVOS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Meta de peso (kg) — opcional">
          <input
            type="number"
            step="0.1"
            className={inputClass}
            value={form.metaPeso}
            onChange={(e) => update('metaPeso', e.target.value)}
          />
        </Field>

        <Button type="submit" variant="accent" disabled={cargando} className="mt-2">
          {cargando ? 'Generando tu plan…' : 'Generar mi plan'}
        </Button>
      </form>
    </div>
  )
}
