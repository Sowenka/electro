import { format, parseISO, startOfWeek, getWeek, getYear } from 'date-fns'
import { ru } from 'date-fns/locale'

function aggregateGroup(key, label, items) {
  const totalT1 = items.reduce((s, r) => s + r.t1Consumption, 0)
  const totalT2 = items.reduce((s, r) => s + r.t2Consumption, 0)
  const t1Cost = items.reduce((s, r) => s + r.t1Cost, 0)
  const t2Cost = items.reduce((s, r) => s + r.t2Cost, 0)
  const totalCost = t1Cost + t2Cost

  return {
    period: key,
    periodLabel: label,
    totalT1Consumption: +totalT1.toFixed(2),
    totalT2Consumption: +totalT2.toFixed(2),
    totalConsumption: +(totalT1 + totalT2).toFixed(2),
    totalT1Cost: +t1Cost.toFixed(2),
    totalT2Cost: +t2Cost.toFixed(2),
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

export function groupByDay(readings) {
  return readings.map(r => ({
    period: r.date,
    periodLabel: format(parseISO(r.date), 'd MMM', { locale: ru }),
    totalT1Consumption: r.t1Consumption,
    totalT2Consumption: r.t2Consumption,
    totalConsumption: +(r.t1Consumption + r.t2Consumption).toFixed(2),
    totalT1Cost: r.t1Cost,
    totalT2Cost: r.t2Cost,
    totalCost: r.totalCost,
    avgDailyCost: r.totalCost,
    daysCount: 1,
  }))
}

export function groupByWeek(readings) {
  return groupBy(
    readings,
    r => {
      const d = parseISO(r.date)
      const weekStart = startOfWeek(d, { locale: ru })
      return format(weekStart, 'yyyy-MM-dd')
    },
    (key, items) => {
      const d = parseISO(key)
      return `Нед. ${getWeek(d, { locale: ru })}, ${getYear(d)}`
    }
  )
}

export function groupByMonth(readings) {
  return groupBy(
    readings,
    r => r.date.slice(0, 7),
    (key) => {
      const d = parseISO(key + '-01')
      return format(d, 'LLLL yyyy', { locale: ru })
    }
  )
}

export function groupByYear(readings) {
  return groupBy(
    readings,
    r => r.date.slice(0, 4),
    (key) => key + ' год'
  )
}

export function filterByPeriod(readings, dateFrom, dateTo) {
  return readings.filter(r => r.date >= dateFrom && r.date <= dateTo)
}

export function getAnalyticsData(readings, periodType, dateFrom, dateTo) {
  const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date))
  const filtered = dateFrom && dateTo ? filterByPeriod(sorted, dateFrom, dateTo) : sorted

  switch (periodType) {
    case 'day': return groupByDay(filtered)
    case 'week': return groupByWeek(filtered)
    case 'month': return groupByMonth(filtered)
    case 'year': return groupByYear(filtered)
    case 'custom': return groupByDay(filtered)
    default: return groupByDay(filtered)
  }
}
