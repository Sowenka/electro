import { NavLink, Outlet } from 'react-router-dom'
import { PenLine, History, BarChart3 } from 'lucide-react'

export default function ResourceLayout({ basePath }) {
  const tabs = [
    { to: `/${basePath}/readings`, icon: PenLine, label: 'Показания' },
    { to: `/${basePath}/history`, icon: History, label: 'История' },
    { to: `/${basePath}/analytics`, icon: BarChart3, label: 'Аналитика' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-tertiary rounded-xl p-1">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-secondary text-primary shadow-sm'
                  : 'text-muted hover:text-primary'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  )
}
