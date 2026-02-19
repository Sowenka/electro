import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_TARIFF } from '../constants'

const useSettingsStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      currency: '\u20BD',
      meterType: 'two-zone',
      currentTariff: { ...DEFAULT_TARIFF },
      tariffHistory: [],

      updateTariff: (t1Rate, t2Rate, startDate) => {
        const newPeriod = {
          id: crypto.randomUUID(),
          startDate: startDate || new Date().toISOString().split('T')[0],
          t1Rate: parseFloat(t1Rate),
          t2Rate: parseFloat(t2Rate),
        }
        set(state => ({
          currentTariff: { t1Rate: parseFloat(t1Rate), t2Rate: parseFloat(t2Rate) },
          tariffHistory: [...state.tariffHistory, newPeriod],
        }))
      },

      setTheme: (theme) => set({ theme }),

      setMeterType: (meterType) => set({ meterType }),

      getTariffForDate: (dateStr) => {
        const { tariffHistory, currentTariff } = get()
        if (!tariffHistory.length) return currentTariff
        const applicable = tariffHistory
          .filter(p => p.startDate <= dateStr)
          .sort((a, b) => b.startDate.localeCompare(a.startDate))
        return applicable.length > 0
          ? { t1Rate: applicable[0].t1Rate, t2Rate: applicable[0].t2Rate }
          : currentTariff
      },

      importSettings: (data) => set({
        currentTariff: data.currentTariff || DEFAULT_TARIFF,
        tariffHistory: data.tariffHistory || [],
        meterType: data.meterType || 'two-zone',
      }),
    }),
    {
      name: 'electro-settings',
      version: 1,
    }
  )
)

export default useSettingsStore
