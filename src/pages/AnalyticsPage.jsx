import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts'
import { format, subMonths, subWeeks, subYears } from 'date-fns'
import { TrendingUp, TrendingDown, Calendar, BarChart3, Minus } from 'lucide-react'
import useReadingsStore from '../store/useReadingsStore'
import useSettingsStore from '../store/useSettingsStore'
import { getAnalyticsData } from '../utils/analytics'
import { ANALYTICS_PERIODS, CURRENCY, CHART_COLORS } from '../constants'
import Card from '../components/ui/Card'

function ChartTooltip({ active, payload, label, isSingle }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div className="bg-secondary border border-themed rounded-xl p-3 shadow-card-hover text-sm max-w-xs">
      <p className="font-medium text-primary mb-1">{d?.periodLabel || label}</p>
      <div className="space-y-0.5">
        {isSingle ? (
          <>
            <p className="text-electric-500 font-mono">Расход: {d?.totalConsumption?.toFixed(1)} кВт·ч</p>
            <p className="text-primary font-mono font-medium">Стоимость: {CURRENCY}{d?.totalCost?.toFixed(2)}</p>
          </>
        ) : (
          <>
            <p className="text-day-500 font-mono">T1: {d?.totalT1Consumption?.toFixed(1)} кВт·ч / {CURRENCY}{d?.totalT1Cost?.toFixed(2)}</p>
            <p className="text-night-500 font-mono">T2: {d?.totalT2Consumption?.toFixed(1)} кВт·ч / {CURRENCY}{d?.totalT2Cost?.toFixed(2)}</p>
            <p className="text-primary font-mono font-medium mt-1">Итого: {CURRENCY}{d?.totalCost?.toFixed(2)}</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const readings = useReadingsStore(s => s.readings)
  const meterType = useSettingsStore(s => s.meterType)
  const isSingle = meterType === 'single'
  const sorted = useMemo(() => [...readings].sort((a, b) => a.date.localeCompare(b.date)), [readings])

  const [period, setPeriod] = useState('month')
  const [dateFrom, setDateFrom] = useState(format(subMonths(new Date(), 3), 'yyyy-MM-dd'))
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'))

  const data = useMemo(() => {
    if (period === 'custom') {
      return getAnalyticsData(sorted, period, dateFrom, dateTo)
    }
    return getAnalyticsData(sorted, period)
  }, [sorted, period, dateFrom, dateTo])

  const summary = useMemo(() => {
    if (!data.length) return null
    const totalConsumption = data.reduce((s, d) => s + d.totalConsumption, 0)
    const totalCost = data.reduce((s, d) => s + d.totalCost, 0)
    const totalT1 = data.reduce((s, d) => s + d.totalT1Consumption, 0)
    const totalT2 = data.reduce((s, d) => s + d.totalT2Consumption, 0)
    const avgDaily = data.reduce((s, d) => s + d.avgDailyCost, 0) / data.length
    const totalDays = data.reduce((s, d) => s + d.daysCount, 0)

    return { totalConsumption, totalCost, totalT1, totalT2, avgDaily, totalDays, periods: data.length }
  }, [data])

  if (readings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <BarChart3 className="w-12 h-12 text-muted mb-4" />
        <p className="text-secondary">Нет данных для аналитики</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Period Selector */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {ANALYTICS_PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                period === p.key
                  ? 'bg-electric-500 text-white shadow-electric'
                  : 'bg-tertiary text-secondary hover:text-primary'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {period === 'custom' && (
          <div className="flex flex-wrap gap-3 mt-4">
            <div>
              <label className="block text-xs text-muted mb-1">От</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="bg-tertiary border border-themed rounded-lg px-3 py-1.5 text-sm text-primary focus:border-electric-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">До</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="bg-tertiary border border-themed rounded-lg px-3 py-1.5 text-sm text-primary focus:border-electric-500 outline-none"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Summary Cards */}
      {summary && (
        <div className={`grid gap-3 ${isSingle ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
          <SummaryCard title="Всего кВт·ч" value={summary.totalConsumption.toFixed(1)} subtitle={`${summary.totalDays} дн.`} />
          <SummaryCard title="Стоимость" value={`${CURRENCY}${summary.totalCost.toFixed(0)}`} subtitle={`${summary.periods} период(ов)`} />
          {!isSingle && (
            <>
              <SummaryCard title="T1 (день)" value={summary.totalT1.toFixed(1)} subtitle="кВт·ч" color="day" />
              <SummaryCard title="T2 (ночь)" value={summary.totalT2.toFixed(1)} subtitle="кВт·ч" color="night" />
            </>
          )}
        </div>
      )}

      {/* Consumption Bar Chart */}
      <Card className="p-4 lg:p-5">
        <h3 className="text-sm font-semibold text-primary mb-4">Потребление</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} />
            <XAxis
              dataKey="periodLabel"
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={{ stroke: 'var(--border-color)' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip content={<ChartTooltip isSingle={isSingle} />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} iconType="circle" iconSize={8} />
            {isSingle ? (
              <Bar dataKey="totalConsumption" name="Потребление" fill={CHART_COLORS.total} radius={[4, 4, 0, 0]} maxBarSize={40} />
            ) : (
              <>
                <Bar dataKey="totalT1Consumption" name="T1 (день)" fill={CHART_COLORS.day} radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="totalT2Consumption" name="T2 (ночь)" fill={CHART_COLORS.night} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Cost Line Chart */}
      <Card className="p-4 lg:p-5">
        <h3 className="text-sm font-semibold text-primary mb-4">Стоимость</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} />
            <XAxis
              dataKey="periodLabel"
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={{ stroke: 'var(--border-color)' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip content={<ChartTooltip isSingle={isSingle} />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} iconType="circle" iconSize={8} />
            {isSingle ? (
              <Line type="monotone" dataKey="totalCost" name={`Стоимость (${CURRENCY})`} stroke={CHART_COLORS.total} strokeWidth={2.5} dot={{ r: 3 }} />
            ) : (
              <>
                <Line type="monotone" dataKey="totalT1Cost" name={`T1 (${CURRENCY})`} stroke={CHART_COLORS.day} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="totalT2Cost" name={`T2 (${CURRENCY})`} stroke={CHART_COLORS.night} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="totalCost" name={`Итого (${CURRENCY})`} stroke={CHART_COLORS.total} strokeWidth={2.5} dot={{ r: 3 }} />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Average Daily Cost */}
      {data.length > 0 && (
        <Card className="p-4 lg:p-5">
          <h3 className="text-sm font-semibold text-primary mb-4">Средняя стоимость в день</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} />
              <XAxis
                dataKey="periodLabel"
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                axisLine={{ stroke: 'var(--border-color)' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip content={<ChartTooltip isSingle={isSingle} />} />
              <Bar dataKey="avgDailyCost" name={`Среднее (${CURRENCY}/день)`} fill={CHART_COLORS.total} radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </motion.div>
  )
}

function SummaryCard({ title, value, subtitle, color }) {
  const colorClass = color === 'day' ? 'text-day-500' : color === 'night' ? 'text-night-500' : 'text-primary'
  return (
    <Card className="p-4 text-center">
      <p className="text-xs text-muted mb-1">{title}</p>
      <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
      <p className="text-xs text-muted mt-0.5">{subtitle}</p>
    </Card>
  )
}
