import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CHART_COLORS } from '../../constants'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-secondary border border-themed rounded-xl p-3 shadow-card-hover text-sm">
      <p className="font-medium text-primary mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-secondary">{p.name}:</span>
          <span className="font-mono font-medium text-primary">{p.value} кВт·ч</span>
        </div>
      ))}
    </div>
  )
}

export default function ConsumptionChart({ data }) {
  const chartData = data.map(r => ({
    name: format(parseISO(r.date), 'd MMM', { locale: ru }),
    'T1 (день)': r.t1Consumption,
    'T2 (ночь)': r.t2Consumption,
  }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} barGap={2}>
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
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px' }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="T1 (день)" fill={CHART_COLORS.day} radius={[4, 4, 0, 0]} maxBarSize={24} />
        <Bar dataKey="T2 (ночь)" fill={CHART_COLORS.night} radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  )
}
