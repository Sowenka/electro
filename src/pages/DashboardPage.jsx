import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Zap, Sun, Moon, Wallet, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format, parseISO, startOfMonth, endOfMonth, subDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import useReadingsStore from '../store/useReadingsStore'
import useSettingsStore from '../store/useSettingsStore'
import { CURRENCY, CHART_COLORS } from '../constants'
import Card from '../components/ui/Card'
import ConsumptionChart from '../components/charts/ConsumptionChart'
import TariffPieChart from '../components/charts/TariffPieChart'
import CostChart from '../components/charts/CostChart'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export default function DashboardPage() {
  const readings = useReadingsStore(s => s.readings)
  const currency = useSettingsStore(s => s.currency)
  const sorted = useMemo(() => [...readings].sort((a, b) => a.date.localeCompare(b.date)), [readings])

  const today = new Date().toISOString().split('T')[0]
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd')

  const monthReadings = useMemo(() =>
    sorted.filter(r => r.date >= monthStart && r.date <= monthEnd),
    [sorted, monthStart, monthEnd]
  )

  const lastReading = sorted[sorted.length - 1]
  const prevReading = sorted.length > 1 ? sorted[sorted.length - 2] : null

  const monthT1 = monthReadings.reduce((s, r) => s + r.t1Consumption, 0)
  const monthT2 = monthReadings.reduce((s, r) => s + r.t2Consumption, 0)
  const monthCost = monthReadings.reduce((s, r) => s + r.totalCost, 0)
  const monthTotal = monthT1 + monthT2

  const todayReading = sorted.find(r => r.date === today)
  const todayConsumption = todayReading ? todayReading.t1Consumption + todayReading.t2Consumption : 0
  const todayCost = todayReading ? todayReading.totalCost : 0

  const last30 = useMemo(() => {
    const cutoff = format(subDays(new Date(), 30), 'yyyy-MM-dd')
    return sorted.filter(r => r.date >= cutoff)
  }, [sorted])

  const kpis = [
    {
      title: 'Сегодня',
      value: todayConsumption.toFixed(1),
      unit: 'кВт·ч',
      subtitle: todayReading ? `${currency}${todayCost.toFixed(2)}` : 'Нет данных',
      icon: Zap,
      color: 'electric',
    },
    {
      title: 'За месяц',
      value: monthTotal.toFixed(1),
      unit: 'кВт·ч',
      subtitle: `${monthReadings.length} дн.`,
      icon: TrendingUp,
      color: 'electric',
    },
    {
      title: 'T1 (день)',
      value: monthT1.toFixed(1),
      unit: 'кВт·ч',
      subtitle: `${currency}${(monthReadings.reduce((s, r) => s + r.t1Cost, 0)).toFixed(2)}`,
      icon: Sun,
      color: 'day',
    },
    {
      title: 'T2 (ночь)',
      value: monthT2.toFixed(1),
      unit: 'кВт·ч',
      subtitle: `${currency}${(monthReadings.reduce((s, r) => s + r.t2Cost, 0)).toFixed(2)}`,
      icon: Moon,
      color: 'night',
    },
  ]

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-2xl bg-electric-500/10 flex items-center justify-center mb-6">
          <Zap className="w-10 h-10 text-electric-500" />
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">Добро пожаловать!</h2>
        <p className="text-secondary mb-6 max-w-md">
          Начните вести учёт электроэнергии. Добавьте первое показание счетчика, чтобы увидеть аналитику.
        </p>
        <Link
          to="/readings"
          className="inline-flex items-center gap-2 bg-electric-500 hover:bg-electric-600 text-white px-6 py-3 rounded-xl font-medium transition-all"
        >
          Добавить показание <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={i} variants={item}>
            <KpiCard {...kpi} currency={currency} />
          </motion.div>
        ))}
      </div>

      {/* Cost Hero Card */}
      <motion.div variants={item}>
        <Card className="p-5 lg:p-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-secondary">Стоимость за месяц</span>
            <Wallet className="w-5 h-5 text-day-500" />
          </div>
          <p className="text-3xl lg:text-4xl font-bold text-primary">
            {currency}{monthCost.toFixed(2)}
          </p>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-day-500">T1: {currency}{monthReadings.reduce((s, r) => s + r.t1Cost, 0).toFixed(2)}</span>
            <span className="text-night-500">T2: {currency}{monthReadings.reduce((s, r) => s + r.t2Cost, 0).toFixed(2)}</span>
          </div>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="p-4 lg:p-5">
            <h3 className="text-sm font-semibold text-primary mb-4">Потребление за 30 дней</h3>
            <ConsumptionChart data={last30} />
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="p-4 lg:p-5">
            <h3 className="text-sm font-semibold text-primary mb-4">День / Ночь</h3>
            <TariffPieChart t1={monthT1} t2={monthT2} />
          </Card>
        </motion.div>
      </div>

      {/* Cost Chart */}
      <motion.div variants={item}>
        <Card className="p-4 lg:p-5">
          <h3 className="text-sm font-semibold text-primary mb-4">Стоимость по дням</h3>
          <CostChart data={last30} />
        </Card>
      </motion.div>

      {/* Recent Readings */}
      <motion.div variants={item}>
        <Card className="p-4 lg:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-primary">Последние записи</h3>
            <Link to="/history" className="text-sm text-electric-500 hover:text-electric-400 flex items-center gap-1">
              Все записи <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-themed">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted uppercase">Дата</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-muted uppercase">T1</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-muted uppercase">T2</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-muted uppercase">Расход</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-muted uppercase">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {sorted.slice(-5).reverse().map(r => (
                  <tr key={r.id} className="border-b border-themed/50 hover:bg-tertiary transition-colors">
                    <td className="py-2.5 px-3 text-primary">
                      {format(parseISO(r.date), 'd MMM', { locale: ru })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-day-500">
                      +{r.t1Consumption}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-night-500">
                      +{r.t2Consumption}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-primary">
                      {(r.t1Consumption + r.t2Consumption).toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-primary">
                      {currency}{r.totalCost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function KpiCard({ title, value, unit, subtitle, icon: Icon, color }) {
  const colorMap = {
    electric: { bg: 'bg-electric-500/10', text: 'text-electric-500' },
    day: { bg: 'bg-day-400/10', text: 'text-day-500' },
    night: { bg: 'bg-night-500/10', text: 'text-night-500' },
  }
  const c = colorMap[color] || colorMap.electric

  return (
    <Card className="p-4 lg:p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs lg:text-sm text-secondary">{title}</span>
        <div className={`p-1.5 lg:p-2 rounded-lg ${c.bg}`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
      </div>
      <p className="text-xl lg:text-2xl font-bold text-primary">
        {value} <span className="text-xs lg:text-sm font-normal text-secondary">{unit}</span>
      </p>
      {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
    </Card>
  )
}
