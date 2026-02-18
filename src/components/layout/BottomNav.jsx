import { NavLink } from 'react-router-dom'
import { LayoutDashboard, PenLine, History, BarChart3, Settings } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
  { to: '/readings', icon: PenLine, label: 'Ввод' },
  { to: '/history', icon: History, label: 'История' },
  { to: '/analytics', icon: BarChart3, label: 'Анализ' },
  { to: '/settings', icon: Settings, label: 'Ещё' },
]

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-secondary/95 backdrop-blur-md border-t border-themed z-50 safe-area-pb">
      <div className="flex items-center justify-around px-1 py-1.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[11px] font-medium min-w-[56px] transition-all duration-200 ${
                isActive
                  ? 'text-electric-500'
                  : 'text-muted'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
