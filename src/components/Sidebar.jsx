import { NavLink } from 'react-router-dom'
import { Home, Dumbbell, Apple, LineChart, Trophy, Settings } from 'lucide-react'

const ITEMS = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/entrenamiento', icon: Dumbbell, label: 'Entrenamiento' },
  { to: '/alimentacion', icon: Apple, label: 'Alimentación' },
  { to: '/progreso', icon: LineChart, label: 'Progreso' },
  { to: '/logros', icon: Trophy, label: 'Logros' },
  { to: '/ajustes', icon: Settings, label: 'Ajustes' }
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 bg-ink text-paper px-4 py-8 z-20">
      <div className="mb-10 px-2">
        <p className="font-display text-xl font-bold">FitSatus</p>
        <p className="text-paper/50 text-xs mt-0.5">Tu asistente de hábitos</p>
      </div>
      <nav className="flex flex-col gap-1">
        {ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive ? 'bg-amber text-ink-dark' : 'text-paper/70 hover:bg-white/5 hover:text-paper'
              }`
            }
          >
            <Icon size={18} strokeWidth={2.2} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
