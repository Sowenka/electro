import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Zap, Droplets, Flame, Settings } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
  { to: '/electricity', icon: Zap, label: 'Электро' },
  { to: '/water', icon: Droplets, label: 'Вода' },
  { to: '/gas', icon: Flame, label: 'Газ' },
  { to: '/settings', icon: Settings, label: 'Настройки' },
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
              `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-[10px] font-medium min-w-[52px] transition-all duration-200 ${
                isActive ? 'text-electric-500' : 'text-muted'
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
