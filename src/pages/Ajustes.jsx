import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Header, Card, Button, Field, inputClass } from '../components/UI'
import BottomNav from '../components/BottomNav'

const TIPOS = [
  { value: 'entrenamiento', label: 'Entrenamiento' },
  { value: 'alimentacion', label: 'Alimentación' }
]

export default function Ajustes() {
  const { usuario, cerrarSesion } = useAuth()
  const [recordatorios, setRecordatorios] = useState([])
  const [tipo, setTipo] = useState('entrenamiento')
  const [hora, setHora] = useState('08:00')

  async function cargar() {
    const { data } = await supabase.from('recordatorios').select('*').eq('usuario_id', usuario.id)
    setRecordatorios(data ?? [])
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario.id])

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
          <p className="font-semibold text-sm text-ink-dark mb-2">Recordatorios</p>
          <form onSubmit={agregarRecordatorio} className="flex gap-2 items-end mb-3">
            <Field label="Tipo">
              <select className={inputClass} value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Hora">
              <input type="time" className={inputClass} value={hora} onChange={(e) => setHora(e.target.value)} />
            </Field>
            <Button variant="accent" type="submit" className="w-auto px-4 mb-4">
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
      <BottomNav />
    </div>
  )
}
