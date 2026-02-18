import { NavLink } from 'react-router-dom'
import { LayoutDashboard, PenLine, History, BarChart3, Settings, Zap } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
  { to: '/readings', icon: PenLine, label: 'Показания' },
  { to: '/history', icon: History, label: 'История' },
  { to: '/analytics', icon: BarChart3, label: 'Аналитика' },
  { to: '/settings', icon: Settings, label: 'Настройки' },
]

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 flex-col bg-secondary border-r border-themed h-screen sticky top-0">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-themed">
        <div className="w-9 h-9 rounded-xl bg-electric-500/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-electric-500" />
        </div>
        <div>
          <span className="text-lg font-bold text-primary">Электро</span>
          <p className="text-xs text-muted">Учёт энергии</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-electric-500/10 text-electric-500 shadow-sm'
                  : 'text-secondary hover:bg-tertiary hover:text-primary'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-themed">
        <p className="text-xs text-muted text-center">v1.0.0</p>
      </div>
    </aside>
  )
}
