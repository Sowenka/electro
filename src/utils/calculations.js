export function calculateReading(formData, prevReading, tariff) {
  const t1Reading = parseFloat(formData.t1Reading)
  const t2Reading = parseFloat(formData.t2Reading)

  const t1Consumption = prevReading
    ? Math.max(0, t1Reading - prevReading.t1Reading)
    : 0
  const t2Consumption = prevReading
    ? Math.max(0, t2Reading - prevReading.t2Reading)
    : 0

  const t1Cost = +(t1Consumption * tariff.t1Rate).toFixed(2)
  const t2Cost = +(t2Consumption * tariff.t2Rate).toFixed(2)

  return {
    id: crypto.randomUUID(),
    date: formData.date,
    t1Reading,
    t2Reading,
    t1Consumption: +t1Consumption.toFixed(2),
    t2Consumption: +t2Consumption.toFixed(2),
    t1Cost,
    t2Cost,
    totalCost: +(t1Cost + t2Cost).toFixed(2),
    tariffSnapshot: { ...tariff },
    note: formData.note || '',
    createdAt: new Date().toISOString(),
  }
}

export function previewCalculation(t1Input, t2Input, prevReading, tariff) {
  const t1 = parseFloat(t1Input) || 0
  const t2 = parseFloat(t2Input) || 0

  if (!prevReading) return null

  const t1Consumption = Math.max(0, t1 - prevReading.t1Reading)
  const t2Consumption = Math.max(0, t2 - prevReading.t2Reading)
  const t1Cost = +(t1Consumption * tariff.t1Rate).toFixed(2)
  const t2Cost = +(t2Consumption * tariff.t2Rate).toFixed(2)

  return {
    t1Consumption: +t1Consumption.toFixed(2),
    t2Consumption: +t2Consumption.toFixed(2),
    t1Cost,
    t2Cost,
    totalCost: +(t1Cost + t2Cost).toFixed(2),
  }
}

export function recalculateAllReadings(readings, tariffGetter) {
  const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date))
  const result = []

  for (let i = 0; i < sorted.length; i++) {
    const prev = i > 0 ? result[i - 1] : null
    const tariff = tariffGetter ? tariffGetter(sorted[i].date) : sorted[i].tariffSnapshot
    const recalculated = calculateReading(
      { date: sorted[i].date, t1Reading: sorted[i].t1Reading, t2Reading: sorted[i].t2Reading, note: sorted[i].note },
      prev,
      tariff
    )
    recalculated.id = sorted[i].id
    recalculated.createdAt = sorted[i].createdAt
    result.push(recalculated)
  }

  return result
}
