import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculateGasReading, recalculateGasReadings } from '../utils/gasCalculations'

const useGasStore = create(
  persist(
    (set, get) => ({
      readings: [],
      tariff: { rate: 0 },
      tariffHistory: [],

      updateTariff: (rate) => {
        const newPeriod = {
          id: crypto.randomUUID(),
          startDate: new Date().toISOString().split('T')[0],
          rate: parseFloat(rate),
        }
        set(state => ({
          tariff: { rate: parseFloat(rate) },
          tariffHistory: [...state.tariffHistory, newPeriod],
        }))
      },

      getTariffForDate: (dateStr) => {
        const { tariffHistory, tariff } = get()
        if (!tariffHistory.length) return tariff
        const applicable = tariffHistory
          .filter(p => p.startDate <= dateStr)
          .sort((a, b) => b.startDate.localeCompare(a.startDate))
        return applicable.length > 0
          ? { rate: applicable[0].rate }
          : tariff
      },

      addReading: (formData, tariff) => {
        const { readings } = get()
        const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date))
        const prev = sorted.filter(r => r.date < formData.date).at(-1) || null
        const newReading = calculateGasReading(formData, prev, tariff)
        set({ readings: recalculateGasReadings([...readings, newReading]) })
        return newReading
      },

      deleteReading: (id) => {
        const { readings } = get()
        set({ readings: recalculateGasReadings(readings.filter(r => r.id !== id)) })
      },

      getLastReading: () => {
        const { readings } = get()
        if (!readings.length) return null
        return [...readings].sort((a, b) => a.date.localeCompare(b.date)).at(-1)
      },

      getPrevReadingForDate: (date) => {
        const { readings } = get()
        const before = readings.filter(r => r.date < date).sort((a, b) => a.date.localeCompare(b.date))
        return before.at(-1) || null
      },

      getSortedReadings: () => {
        const { readings } = get()
        return [...readings].sort((a, b) => a.date.localeCompare(b.date))
      },

      importReadings: (data) => set({ readings: recalculateGasReadings(data) }),
      clearReadings: () => set({ readings: [] }),
    }),
    { name: 'meter-gas', version: 1 }
  )
)

export default useGasStore
