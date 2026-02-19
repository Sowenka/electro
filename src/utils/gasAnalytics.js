import { format, parseISO, startOfWeek, getWeek, getYear } from 'date-fns'
import { ru } from 'date-fns/locale'

function aggregateGroup(key, label, items) {
  const totalConsumption = items.reduce((s, r) => s + r.consumption, 0)
  const totalCost = items.reduce((s, r) => s + r.cost, 0)

  return {
    period: key,
    periodLabel: label,
    totalConsumption: +totalConsumption.toFixed(3),
    totalCost: +totalCost.toFixed(2),
    avgDailyCost: items.length > 0 ? +(totalCost / items.length).toFixed(2) : 0,
    daysCount: items.length,
  }
}

function groupBy(readings, keyFn, labelFn) {
  const groups = {}
  readings.forEach(r => {
    const key = keyFn(r)
    if (!groups[key]) groups[key] = []
    groups[key].push(r)
  })
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => aggregateGroup(key, labelFn(key, items), items))
}

function groupByDay(readings) {
  return readings.map(r => ({
    period: r.date,
    periodLabel: format(parseISO(r.date), 'd MMM', { locale: ru }),
    totalConsumption: r.consumption,
    totalCost: r.cost,
    avgDailyCost: r.cost,
    daysCount: 1,
  }))
}

function groupByWeek(readings) {
  return groupBy(
    readings,
    r => format(startOfWeek(parseISO(r.date), { locale: ru }), 'yyyy-MM-dd'),
    (key) => `Нед. ${getWeek(parseISO(key), { locale: ru })}, ${getYear(parseISO(key))}`
  )
}

function groupByMonth(readings) {
  return groupBy(
    readings,
    r => r.date.slice(0, 7),
    (key) => format(parseISO(key + '-01'), 'LLLL yyyy', { locale: ru })
  )
}

function groupByYear(readings) {
  return groupBy(
    readings,
    r => r.date.slice(0, 4),
    (key) => key + ' год'
  )
}

export function getGasAnalyticsData(readings, periodType, dateFrom, dateTo) {
  const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date))
  const filtered = dateFrom && dateTo
    ? sorted.filter(r => r.date >= dateFrom && r.date <= dateTo)
    : sorted

  switch (periodType) {
    case 'day': return groupByDay(filtered)
    case 'week': return groupByWeek(filtered)
    case 'month': return groupByMonth(filtered)
    case 'year': return groupByYear(filtered)
    case 'custom': return groupByDay(filtered)
    default: return groupByDay(filtered)
  }
}
