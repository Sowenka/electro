import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { CHART_COLORS } from '../../constants'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-secondary border border-themed rounded-xl p-3 shadow-card-hover text-sm">
      <p className="text-primary font-medium">{name}: {value.toFixed(1)} кВт·ч</p>
    </div>
  )
}

const RADIAN = Math.PI / 180
function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function TariffPieChart({ t1, t2 }) {
  const data = [
    { name: 'T1 (день)', value: +t1.toFixed(2) },
    { name: 'T2 (ночь)', value: +t2.toFixed(2) },
  ]
  const colors = [CHART_COLORS.day, CHART_COLORS.night]

  if (t1 === 0 && t2 === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm text-muted">
        Нет данных
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={40}
          outerRadius={70}
          paddingAngle={4}
          dataKey="value"
          labelLine={false}
          label={renderLabel}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i]} stroke="none" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px' }}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
