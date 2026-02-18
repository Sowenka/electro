import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CHART_COLORS } from '../../constants'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const data = payload[0]?.payload
  return (
    <div className="bg-secondary border border-themed rounded-xl p-3 shadow-card-hover text-sm">
      <p className="font-medium text-primary mb-1">{label}</p>
      <div className="space-y-0.5">
        <p className="text-day-500 font-mono">T1: {data?.t1Cost?.toFixed(2)} \u20BD</p>
        <p className="text-night-500 font-mono">T2: {data?.t2Cost?.toFixed(2)} \u20BD</p>
        <p className="text-primary font-mono font-medium">Итого: {data?.totalCost?.toFixed(2)} \u20BD</p>
      </div>
    </div>
  )
}

export default function CostChart({ data }) {
  const chartData = data.map(r => ({
    name: format(parseISO(r.date), 'd MMM', { locale: ru }),
    total: r.totalCost,
    t1Cost: r.t1Cost,
    t2Cost: r.t2Cost,
    totalCost: r.totalCost,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.total} stopOpacity={0.3} />
            <stop offset="100%" stopColor={CHART_COLORS.total} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
          axisLine={{ stroke: 'var(--border-color)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="total"
          stroke={CHART_COLORS.total}
          strokeWidth={2}
          fill="url(#costGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
