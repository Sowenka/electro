import { useLocation } from 'react-router-dom'
import { Sun, Moon, Monitor, Gauge } from 'lucide-react'
import useSettingsStore from '../../store/useSettingsStore'

const pageTitles = {
  '/dashboard': 'Дашборд',
  '/electricity/readings': 'Электроэнергия',
  '/electricity/history': 'Электроэнергия',
  '/electricity/analytics': 'Электроэнергия',
  '/water/readings': 'Водоснабжение',
  '/water/history': 'Водоснабжение',
  '/water/analytics': 'Водоснабжение',
  '/gas/readings': 'Газ',
  '/gas/history': 'Газ',
  '/gas/analytics': 'Газ',
  '/settings': 'Настройки',
}

const themeIcons = { light: Sun, dark: Moon, system: Monitor }
const themeOrder = ['light', 'dark', 'system']

export default function TopBar() {
  const location = useLocation()
  const theme = useSettingsStore(s => s.theme)
  const setTheme = useSettingsStore(s => s.setTheme)

  const title = pageTitles[location.pathname] || 'Счётчики'
  const ThemeIcon = themeIcons[theme]

  const cycleTheme = () => {
    const idx = themeOrder.indexOf(theme)
    setTheme(themeOrder[(idx + 1) % themeOrder.length])
  }

  return (
    <header className="sticky top-0 z-40 bg-secondary/80 backdrop-blur-md border-b border-themed px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="lg:hidden w-8 h-8 rounded-lg bg-electric-500/10 flex items-center justify-center">
            <Gauge className="w-4 h-4 text-electric-500" />
          </div>
          <h1 className="text-lg font-bold text-primary">{title}</h1>
        </div>
        <button
          onClick={cycleTheme}
          className="p-2 rounded-xl text-secondary hover:text-primary hover:bg-tertiary transition-all duration-200"
          title={`Тема: ${theme}`}
        >
          <ThemeIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
