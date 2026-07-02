import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { CATALOGO_LOGROS, evaluarLogros } from '../lib/business'
import { Header, Card } from '../components/UI'
import { Trophy, Lock } from 'lucide-react'

export default function Logros() {
  const { usuario } = useAuth()
  const [desbloqueados, setDesbloqueados] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function evaluar() {
      const { data: progreso } = await supabase.from('progreso').select('*').eq('usuario_id', usuario.id)
      const { data: registros } = await supabase.from('registros_diarios').select('*').eq('usuario_id', usuario.id)
      const { data: planes } = await supabase.from('planes_entrenamiento').select('id').eq('usuario_id', usuario.id)
      const { data: objetivo } = await supabase
        .from('objetivos')
        .select('*')
        .eq('usuario_id', usuario.id)
        .order('fecha_inicio', { ascending: false })
        .limit(1)
        .maybeSingle()

      const logrosActivos = evaluarLogros({
        registrosDiarios: registros ?? [],
        progreso: progreso ?? [],
        planesGenerados: planes?.length ?? 0,
        objetivo: objetivo ? { metaPeso: objetivo.meta_peso } : null
      })

      // Persistir logros nuevos para tener fecha de obtención (idempotente vía upsert)
      for (const logro of logrosActivos) {
        await supabase
          .from('logros')
          .upsert(
            { usuario_id: usuario.id, codigo: logro.codigo, nombre: logro.nombre, descripcion: logro.descripcion },
            { onConflict: 'usuario_id,codigo', ignoreDuplicates: true }
          )
      }

      setDesbloqueados(logrosActivos.map((l) => l.codigo))
      setCargando(false)
    }
    evaluar()
  }, [usuario.id])

  return (
    <div className="min-h-full">
      <Header eyebrow="Motivación" title="Tus logros" subtitle="Sigue avanzando para desbloquearlos todos" />

      <div className="px-6 -mt-4 space-y-3">
        {cargando && <p className="text-xs text-ink-dark/50">Revisando tus avances…</p>}
        {CATALOGO_LOGROS.map((logro) => {
          const activo = desbloqueados.includes(logro.codigo)
          return (
            <Card key={logro.codigo} className={activo ? 'border-amber' : 'opacity-70'}>
              <div className="flex items-center gap-3">
                {activo ? <Trophy className="text-amber-dark" size={22} /> : <Lock className="text-ink/30" size={22} />}
                <div>
                  <p className="font-semibold text-sm text-ink-dark">{logro.nombre}</p>
                  <p className="text-xs text-ink-dark/60">{logro.descripcion}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="h-4" />
      
    </div>
  )
}
