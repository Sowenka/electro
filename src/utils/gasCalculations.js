export function calculateGasReading(formData, prevReading, tariff) {
  const reading = parseFloat(formData.reading)
  const consumption = prevReading ? Math.max(0, reading - prevReading.reading) : 0
  const cost = +(consumption * tariff.rate).toFixed(2)

  return {
    id: crypto.randomUUID(),
    date: formData.date,
    reading,
    consumption: +consumption.toFixed(3),
    cost,
    totalCost: cost,
    tariffSnapshot: { ...tariff },
    note: formData.note || '',
    createdAt: new Date().toISOString(),
  }
}

export function previewGasCalculation(input, prevReading, tariff) {
  const val = parseFloat(input) || 0
  if (!prevReading) return null
  const consumption = Math.max(0, val - prevReading.reading)
  const cost = +(consumption * tariff.rate).toFixed(2)
  return { consumption: +consumption.toFixed(3), cost }
}

export function recalculateGasReadings(readings) {
  const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date))
  const result = []
  for (let i = 0; i < sorted.length; i++) {
    const prev = i > 0 ? result[i - 1] : null
    const tariff = sorted[i].tariffSnapshot
    const recalculated = calculateGasReading(
      { date: sorted[i].date, reading: sorted[i].reading, note: sorted[i].note },
      prev,
      tariff
    )
    recalculated.id = sorted[i].id
    recalculated.createdAt = sorted[i].createdAt
    result.push(recalculated)
  }
  return result
}
