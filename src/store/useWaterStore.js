import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculateWaterReading, recalculateWaterReadings } from '../utils/waterCalculations'

const useWaterStore = create(
  persist(
    (set, get) => ({
      readings: [],
      tariff: { coldRate: 0, hotRate: 0 },
      tariffHistory: [],

      updateTariff: (coldRate, hotRate) => {
        const newPeriod = {
          id: crypto.randomUUID(),
          startDate: new Date().toISOString().split('T')[0],
          coldRate: parseFloat(coldRate),
          hotRate: parseFloat(hotRate),
        }
        set(state => ({
          tariff: { coldRate: parseFloat(coldRate), hotRate: parseFloat(hotRate) },
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
          ? { coldRate: applicable[0].coldRate, hotRate: applicable[0].hotRate }
          : tariff
      },

      addReading: (formData, tariff) => {
        const { readings } = get()
        const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date))
        const prev = sorted.filter(r => r.date < formData.date).at(-1) || null
        const newReading = calculateWaterReading(formData, prev, tariff)
        set({ readings: recalculateWaterReadings([...readings, newReading]) })
        return newReading
      },

      deleteReading: (id) => {
        const { readings } = get()
        set({ readings: recalculateWaterReadings(readings.filter(r => r.id !== id)) })
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

      importReadings: (data) => set({ readings: recalculateWaterReadings(data) }),
      clearReadings: () => set({ readings: [] }),
    }),
    { name: 'meter-water', version: 1 }
  )
)

export default useWaterStore
