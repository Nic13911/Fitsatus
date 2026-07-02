import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Header, Card, Button, Field, inputClass } from '../components/UI'

export default function Progreso() {
  const { usuario } = useAuth()
  const [historial, setHistorial] = useState([])
  const [pesoNuevo, setPesoNuevo] = useState('')
  const [cargando, setCargando] = useState(true)

  async function cargar() {
    const { data } = await supabase
      .from('progreso')
      .select('*')
      .eq('usuario_id', usuario.id)
      .order('fecha', { ascending: true })
    setHistorial(data ?? [])
    setCargando(false)
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario.id])

  async function registrarPeso(e) {
    e.preventDefault()
    const peso = Number(pesoNuevo)
    if (!(peso > 0)) return
    await supabase.from('progreso').insert({
      usuario_id: usuario.id,
      fecha: new Date().toISOString().slice(0, 10),
      peso
    })
    setPesoNuevo('')
    await cargar()
  }

  const datosGrafico = historial.map((h) => ({ fecha: h.fecha.slice(5), peso: h.peso }))

  return (
    <div className="min-h-full">
      <Header eyebrow="Seguimiento" title="Tu progreso" subtitle="Evolución de tu peso en el tiempo" />

      <div className="px-6 -mt-4 space-y-4">
        <Card>
          {cargando ? (
            <p className="text-xs text-ink-dark/50">Cargando historial…</p>
          ) : datosGrafico.length > 1 ? (
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <LineChart data={datosGrafico}>
                  <CartesianGrid stroke="#E4DFD0" strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11 }} stroke="#0F3D3E" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#0F3D3E" domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="peso" stroke="#E8604C" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-ink-dark/50">
              Registra al menos dos mediciones de peso para ver tu gráfico de evolución.
            </p>
          )}
        </Card>

        <Card>
          <p className="font-semibold text-sm text-ink-dark mb-2">Registrar peso de hoy</p>
          <form onSubmit={registrarPeso} className="flex gap-2 items-end">
            <Field label="Peso (kg)" className="flex-1 min-w-0">
              <input
                type="number"
                step="0.1"
                min="1"
                className={inputClass}
                value={pesoNuevo}
                onChange={(e) => setPesoNuevo(e.target.value)}
                placeholder="70.5"
              />
            </Field>
            <Button variant="accent" type="submit" className="w-auto px-4 mb-4 shrink-0">
              Guardar
            </Button>
          </form>
        </Card>

        <Card>
          <p className="font-semibold text-sm text-ink-dark mb-2">Historial</p>
          <ul className="divide-y divide-line">
            {[...historial]
              .reverse()
              .slice(0, 10)
              .map((h) => (
                <li key={h.id} className="py-2 flex justify-between text-sm">
                  <span className="text-ink-dark/70">{h.fecha}</span>
                  <span className="font-semibold text-ink-dark">{h.peso} kg</span>
                </li>
              ))}
            {historial.length === 0 && <p className="text-xs text-ink-dark/50 py-2">Sin registros todavía.</p>}
          </ul>
        </Card>
      </div>

      <div className="h-4" />
      
    </div>
  )
}
