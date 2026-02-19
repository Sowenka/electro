export function calculateWaterReading(formData, prevReading, tariff) {
  const coldReading = parseFloat(formData.coldReading)
  const hotReading = parseFloat(formData.hotReading)

  const coldConsumption = prevReading ? Math.max(0, coldReading - prevReading.coldReading) : 0
  const hotConsumption = prevReading ? Math.max(0, hotReading - prevReading.hotReading) : 0

  const coldCost = +(coldConsumption * tariff.coldRate).toFixed(2)
  const hotCost = +(hotConsumption * tariff.hotRate).toFixed(2)

  return {
    id: crypto.randomUUID(),
    date: formData.date,
    coldReading,
    hotReading,
    coldConsumption: +coldConsumption.toFixed(3),
    hotConsumption: +hotConsumption.toFixed(3),
    coldCost,
    hotCost,
    totalCost: +(coldCost + hotCost).toFixed(2),
    tariffSnapshot: { ...tariff },
    note: formData.note || '',
    createdAt: new Date().toISOString(),
  }
}

export function previewWaterCalculation(coldInput, hotInput, prevReading, tariff) {
  const cold = parseFloat(coldInput) || 0
  const hot = parseFloat(hotInput) || 0
  if (!prevReading) return null

  const coldConsumption = Math.max(0, cold - prevReading.coldReading)
  const hotConsumption = Math.max(0, hot - prevReading.hotReading)
  const coldCost = +(coldConsumption * tariff.coldRate).toFixed(2)
  const hotCost = +(hotConsumption * tariff.hotRate).toFixed(2)

  return {
    coldConsumption: +coldConsumption.toFixed(3),
    hotConsumption: +hotConsumption.toFixed(3),
    coldCost,
    hotCost,
    totalCost: +(coldCost + hotCost).toFixed(2),
  }
}

export function recalculateWaterReadings(readings) {
  const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date))
  const result = []
  for (let i = 0; i < sorted.length; i++) {
    const prev = i > 0 ? result[i - 1] : null
    const tariff = sorted[i].tariffSnapshot
    const recalculated = calculateWaterReading(
      { date: sorted[i].date, coldReading: sorted[i].coldReading, hotReading: sorted[i].hotReading, note: sorted[i].note },
      prev,
      tariff
    )
    recalculated.id = sorted[i].id
    recalculated.createdAt = sorted[i].createdAt
    result.push(recalculated)
  }
  return result
}
