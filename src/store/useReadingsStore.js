import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculateReading, recalculateAllReadings } from '../utils/calculations'

const useReadingsStore = create(
  persist(
    (set, get) => ({
      readings: [],

      addReading: (formData, tariff) => {
        const { readings } = get()
        const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date))
        const prevByDate = sorted.filter(r => r.date < formData.date)
        const prev = prevByDate.length > 0 ? prevByDate[prevByDate.length - 1] : null

        const newReading = calculateReading(formData, prev, tariff)
        const updated = [...readings, newReading]

        set({ readings: recalculateAllReadings(updated) })
        return newReading
      },

      updateReading: (id, formData, tariff) => {
        const { readings } = get()
        const updated = readings.map(r =>
          r.id === id
            ? { ...r, date: formData.date, t1Reading: parseFloat(formData.t1Reading), t2Reading: parseFloat(formData.t2Reading), note: formData.note || '', tariffSnapshot: { ...tariff } }
            : r
        )
        set({ readings: recalculateAllReadings(updated) })
      },

      deleteReading: (id) => {
        const { readings } = get()
        const filtered = readings.filter(r => r.id !== id)
        set({ readings: recalculateAllReadings(filtered) })
      },

      getLastReading: () => {
        const { readings } = get()
        if (!readings.length) return null
        const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date))
        return sorted[sorted.length - 1]
      },

      getPrevReadingForDate: (date) => {
        const { readings } = get()
        const before = readings.filter(r => r.date < date).sort((a, b) => a.date.localeCompare(b.date))
        return before.length > 0 ? before[before.length - 1] : null
      },

      getSortedReadings: () => {
        const { readings } = get()
        return [...readings].sort((a, b) => a.date.localeCompare(b.date))
      },

      importReadings: (data) => {
        set({ readings: recalculateAllReadings(data) })
      },

      clearReadings: () => set({ readings: [] }),
    }),
    {
      name: 'electro-readings',
      version: 1,
    }
  )
)

export default useReadingsStore
