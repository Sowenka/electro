import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts'
import { format, subMonths } from 'date-fns'
import { BarChart3 } from 'lucide-react'
import useWaterStore from '../../store/useWaterStore'
import { getWaterAnalyticsData } from '../../utils/waterAnalytics'
import { ANALYTICS_PERIODS } from '../../constants'
import Card from '../../components/ui/Card'

const CURRENCY = '₽'
const COLORS = { cold: '#60A5FA', hot: '#FB923C', total: '#1A85FF' }

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div className="bg-secondary border border-themed rounded-xl p-3 shadow-card-hover text-sm max-w-xs">
      <p className="font-medium text-primary mb-1">{d?.periodLabel || label}</p>
      <div className="space-y-0.5">
        <p style={{ color: COLORS.cold }} className="font-mono">ХВС: {d?.totalColdConsumption?.toFixed(3)} м³ / {CURRENCY}{d?.totalColdCost?.toFixed(2)}</p>
        <p style={{ color: COLORS.hot }} className="font-mono">ГВС: {d?.totalHotConsumption?.toFixed(3)} м³ / {CURRENCY}{d?.totalHotCost?.toFixed(2)}</p>
        <p className="text-primary font-mono font-medium mt-1">Итого: {CURRENCY}{d?.totalCost?.toFixed(2)}</p>
      </div>
    </div>
  )
}

function SummaryCard({ title, value, subtitle, color }) {
  return (
    <Card className="p-4 text-center">
      <p className="text-xs text-muted mb-1">{title}</p>
      <p className="text-xl font-bold" style={color ? { color } : undefined}>{value}</p>
      <p className="text-xs text-muted mt-0.5">{subtitle}</p>
    </Card>
  )
}

export default function WaterAnalyticsPage() {
  const readings = useWaterStore(s => s.readings)
  const sorted = useMemo(() => [...readings].sort((a, b) => a.date.localeCompare(b.date)), [readings])

  const [period, setPeriod] = useState('month')
  const [dateFrom, setDateFrom] = useState(format(subMonths(new Date(), 3), 'yyyy-MM-dd'))
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'))

  const data = useMemo(() => getWaterAnalyticsData(sorted, period, period === 'custom' ? dateFrom : undefined, period === 'custom' ? dateTo : undefined), [sorted, period, dateFrom, dateTo])

  const summary = useMemo(() => {
    if (!data.length) return null
    return {
      totalConsumption: data.reduce((s, d) => s + d.totalConsumption, 0),
      totalCost: data.reduce((s, d) => s + d.totalCost, 0),
      totalCold: data.reduce((s, d) => s + d.totalColdConsumption, 0),
      totalHot: data.reduce((s, d) => s + d.totalHotConsumption, 0),
      totalDays: data.reduce((s, d) => s + d.daysCount, 0),
      periods: data.length,
    }
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
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {ANALYTICS_PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${period === p.key ? 'bg-blue-500 text-white' : 'bg-tertiary text-secondary hover:text-primary'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {period === 'custom' && (
          <div className="flex flex-wrap gap-3 mt-4">
            <div>
              <label className="block text-xs text-muted mb-1">От</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-tertiary border border-themed rounded-lg px-3 py-1.5 text-sm text-primary focus:border-blue-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">До</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-tertiary border border-themed rounded-lg px-3 py-1.5 text-sm text-primary focus:border-blue-400 outline-none" />
            </div>
          </div>
        )}
      </Card>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard title="Всего м³" value={summary.totalConsumption.toFixed(3)} subtitle={`${summary.totalDays} дн.`} />
          <SummaryCard title="Стоимость" value={`${CURRENCY}${summary.totalCost.toFixed(0)}`} subtitle={`${summary.periods} период(ов)`} />
          <SummaryCard title="ХВС" value={summary.totalCold.toFixed(3)} subtitle="м³" color={COLORS.cold} />
          <SummaryCard title="ГВС" value={summary.totalHot.toFixed(3)} subtitle="м³" color={COLORS.hot} />
        </div>
      )}

      <Card className="p-4 lg:p-5">
        <h3 className="text-sm font-semibold text-primary mb-4">Потребление</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} />
            <XAxis dataKey="periodLabel" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border-color)' }} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={50} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} iconType="circle" iconSize={8} />
            <Bar dataKey="totalColdConsumption" name="ХВС (м³)" fill={COLORS.cold} radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="totalHotConsumption" name="ГВС (м³)" fill={COLORS.hot} radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4 lg:p-5">
        <h3 className="text-sm font-semibold text-primary mb-4">Стоимость</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} />
            <XAxis dataKey="periodLabel" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border-color)' }} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={50} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} iconType="circle" iconSize={8} />
            <Line type="monotone" dataKey="totalColdCost" name={`ХВС (${CURRENCY})`} stroke={COLORS.cold} strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="totalHotCost" name={`ГВС (${CURRENCY})`} stroke={COLORS.hot} strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="totalCost" name={`Итого (${CURRENCY})`} stroke={COLORS.total} strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  )
}
