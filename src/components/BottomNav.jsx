import { NavLink } from 'react-router-dom'
import { Home, Dumbbell, Apple, LineChart, Trophy, Settings } from 'lucide-react'

const ITEMS = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/entrenamiento', icon: Dumbbell, label: 'Entreno' },
  { to: '/alimentacion', icon: Apple, label: 'Comidas' },
  { to: '/progreso', icon: LineChart, label: 'Progreso' },
  { to: '/logros', icon: Trophy, label: 'Logros' },
  { to: '/ajustes', icon: Settings, label: 'Ajustes' }
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto bg-ink text-paper rounded-t-2xl px-2 py-2 flex justify-between z-20 sm:absolute">
      {ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl text-[10px] font-semibold tracking-wide transition-colors ${
              isActive ? 'bg-amber text-ink-dark' : 'text-paper/70 hover:text-paper'
            }`
          }
        >
          <Icon size={18} strokeWidth={2.2} />
          <span className="mt-0.5">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
