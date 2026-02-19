import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Zap, Droplets, Flame, Wallet, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ru } from 'date-fns/locale'
import useReadingsStore from '../store/useReadingsStore'
import useWaterStore from '../store/useWaterStore'
import useGasStore from '../store/useGasStore'
import useSettingsStore from '../store/useSettingsStore'
import Card from '../components/ui/Card'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const CURRENCY = '₽'

function ResourceCard({ icon: Icon, title, to, color, consumption, unit, cost, hasData }) {
  const colorMap = {
    electric: { bg: 'bg-electric-500/10', text: 'text-electric-500', border: 'border-l-electric-500' },
    water: { bg: 'bg-blue-400/10', text: 'text-blue-400', border: 'border-l-blue-400' },
    gas: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-l-orange-500' },
  }
  const c = colorMap[color] || colorMap.electric

  return (
    <Link to={to}>
      <Card className={`p-4 border-l-4 ${c.border} hover:shadow-lg transition-shadow`}>
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg ${c.bg}`}>
            <Icon className={`w-5 h-5 ${c.text}`} />
          </div>
          <ArrowRight className="w-4 h-4 text-muted" />
        </div>
        <p className="text-sm text-secondary mb-1">{title}</p>
        {hasData ? (
          <>
            <p className="text-xl font-bold text-primary">
              {consumption} <span className="text-sm font-normal text-muted">{unit}</span>
            </p>
            <p className={`text-sm font-medium mt-0.5 ${c.text}`}>{CURRENCY}{cost}</p>
          </>
        ) : (
          <p className="text-sm text-muted">Нет данных</p>
        )}
      </Card>
    </Link>
  )
}

export default function DashboardPage() {
  const elReadings = useReadingsStore(s => s.readings)
  const waterReadings = useWaterStore(s => s.readings)
  const gasReadings = useGasStore(s => s.readings)
  const currency = useSettingsStore(s => s.currency)
  const meterType = useSettingsStore(s => s.meterType)

  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd')

  const elMonth = useMemo(() =>
    elReadings.filter(r => r.date >= monthStart && r.date <= monthEnd),
    [elReadings, monthStart, monthEnd]
  )
  const waterMonth = useMemo(() =>
    waterReadings.filter(r => r.date >= monthStart && r.date <= monthEnd),
    [waterReadings, monthStart, monthEnd]
  )
  const gasMonth = useMemo(() =>
    gasReadings.filter(r => r.date >= monthStart && r.date <= monthEnd),
    [gasReadings, monthStart, monthEnd]
  )

  const elConsumption = elMonth.reduce((s, r) => s + r.t1Consumption + r.t2Consumption, 0)
  const elCost = elMonth.reduce((s, r) => s + r.totalCost, 0)

  const coldConsumption = waterMonth.reduce((s, r) => s + r.coldConsumption, 0)
  const hotConsumption = waterMonth.reduce((s, r) => s + r.hotConsumption, 0)
  const coldCost = waterMonth.reduce((s, r) => s + r.coldCost, 0)
  const hotCost = waterMonth.reduce((s, r) => s + r.hotCost, 0)

  const gasConsumption = gasMonth.reduce((s, r) => s + r.consumption, 0)
  const gasCost = gasMonth.reduce((s, r) => s + r.cost, 0)

  const totalCost = elCost + coldCost + hotCost + gasCost

  const hasAnyData = elReadings.length > 0 || waterReadings.length > 0 || gasReadings.length > 0

  const currentMonth = format(new Date(), 'LLLL yyyy', { locale: ru })

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      {/* Month header */}
      <motion.div variants={item}>
        <h2 className="text-sm font-medium text-muted capitalize">{currentMonth}</h2>
      </motion.div>

      {/* Total cost hero */}
      {hasAnyData && (
        <motion.div variants={item}>
          <Card className="p-5 lg:p-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-secondary">Итого за месяц</span>
              <Wallet className="w-5 h-5 text-muted" />
            </div>
            <p className="text-3xl lg:text-4xl font-bold text-primary">
              {CURRENCY}{totalCost.toFixed(2)}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted">
              {elReadings.length > 0 && <span>⚡ {CURRENCY}{elCost.toFixed(2)}</span>}
              {waterReadings.length > 0 && <span>💧 {CURRENCY}{(coldCost + hotCost).toFixed(2)}</span>}
              {gasReadings.length > 0 && <span>🔥 {CURRENCY}{gasCost.toFixed(2)}</span>}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Resource cards */}
      <motion.div variants={item}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          <ResourceCard
            icon={Zap}
            title="Электроэнергия"
            to="/electricity"
            color="electric"
            consumption={elConsumption.toFixed(1)}
            unit="кВт·ч"
            cost={elCost.toFixed(2)}
            hasData={elReadings.length > 0}
          />
          <ResourceCard
            icon={Droplets}
            title={waterReadings.length > 0 ? `ХВС ${coldConsumption.toFixed(3)} + ГВС ${hotConsumption.toFixed(3)} м³` : 'Водоснабжение'}
            to="/water"
            color="water"
            consumption={(coldConsumption + hotConsumption).toFixed(3)}
            unit="м³"
            cost={(coldCost + hotCost).toFixed(2)}
            hasData={waterReadings.length > 0}
          />
          <ResourceCard
            icon={Flame}
            title="Газ"
            to="/gas"
            color="gas"
            consumption={gasConsumption.toFixed(3)}
            unit="м³"
            cost={gasCost.toFixed(2)}
            hasData={gasReadings.length > 0}
          />
        </div>
      </motion.div>

      {/* Last readings per resource */}
      {elReadings.length > 0 && (
        <motion.div variants={item}>
          <RecentTable
            title="Последние показания — Электро"
            to="/electricity/history"
            rows={[...elReadings].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map(r => ({
              date: r.date,
              cols: meterType === 'single'
                ? [`${(r.t1Consumption + r.t2Consumption).toFixed(1)} кВт·ч`, `${CURRENCY}${r.totalCost.toFixed(2)}`]
                : [`T1: +${r.t1Consumption}`, `T2: +${r.t2Consumption}`, `${CURRENCY}${r.totalCost.toFixed(2)}`],
            }))}
          />
        </motion.div>
      )}

      {waterReadings.length > 0 && (
        <motion.div variants={item}>
          <RecentTable
            title="Последние показания — Вода"
            to="/water/history"
            rows={[...waterReadings].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map(r => ({
              date: r.date,
              cols: [`ХВС: +${r.coldConsumption}`, `ГВС: +${r.hotConsumption}`, `${CURRENCY}${r.totalCost.toFixed(2)}`],
            }))}
          />
        </motion.div>
      )}

      {gasReadings.length > 0 && (
        <motion.div variants={item}>
          <RecentTable
            title="Последние показания — Газ"
            to="/gas/history"
            rows={[...gasReadings].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map(r => ({
              date: r.date,
              cols: [`+${r.consumption} м³`, `${CURRENCY}${r.cost.toFixed(2)}`],
            }))}
          />
        </motion.div>
      )}

      {!hasAnyData && (
        <motion.div variants={item}>
          <Card className="p-8 text-center">
            <div className="flex justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-electric-500/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-electric-500" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-400/10 flex items-center justify-center">
                <Droplets className="w-6 h-6 text-blue-400" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-primary mb-2">Добро пожаловать!</h2>
            <p className="text-secondary max-w-md mx-auto">
              Начните вести учёт ресурсов. Выберите раздел в меню и добавьте первые показания счётчиков.
            </p>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}

function RecentTable({ title, to, rows }) {
  return (
    <Card className="p-4 lg:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-primary">{title}</h3>
        <Link to={to} className="text-sm text-electric-500 hover:text-electric-400 flex items-center gap-1">
          Все <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 border-b border-themed/50 last:border-0">
            <span className="text-sm text-secondary">
              {format(new Date(row.date), 'd MMM', { locale: ru })}
            </span>
            <div className="flex gap-3 text-sm font-mono">
              {row.cols.map((col, j) => (
                <span key={j} className="text-primary">{col}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
