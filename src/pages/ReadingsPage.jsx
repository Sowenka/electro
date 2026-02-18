import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Check, AlertCircle, Zap } from 'lucide-react'
import useReadingsStore from '../store/useReadingsStore'
import useSettingsStore from '../store/useSettingsStore'
import { previewCalculation } from '../utils/calculations'
import { validateReading } from '../utils/validation'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { CURRENCY } from '../constants'

export default function ReadingsPage() {
  const addReading = useReadingsStore(s => s.addReading)
  const readings = useReadingsStore(s => s.readings)
  const getLastReading = useReadingsStore(s => s.getLastReading)
  const getPrevReadingForDate = useReadingsStore(s => s.getPrevReadingForDate)
  const currentTariff = useSettingsStore(s => s.currentTariff)

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [t1Input, setT1Input] = useState('')
  const [t2Input, setT2Input] = useState('')
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState({})

  const lastReading = useMemo(() => getLastReading(), [readings])
  const prevReading = useMemo(() => getPrevReadingForDate(date), [date, readings])

  const preview = useMemo(() => {
    if (!t1Input && !t2Input) return null
    return previewCalculation(t1Input, t2Input, prevReading, currentTariff)
  }, [t1Input, t2Input, prevReading, currentTariff])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()

    const formData = { date, t1Reading: t1Input, t2Reading: t2Input }
    const validation = validateReading(formData, prevReading, readings)

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    addReading(formData, currentTariff)
    setT1Input('')
    setT2Input('')
    setErrors({})
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }, [date, t1Input, t2Input, prevReading, readings, currentTariff, addReading])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto space-y-4"
    >
      {/* Date */}
      <Card className="p-5">
        <label className="block text-sm font-medium text-secondary mb-2">Дата</label>
        <input
          type="date"
          value={date}
          onChange={e => { setDate(e.target.value); setErrors(prev => ({ ...prev, date: undefined })) }}
          className="w-full bg-tertiary border border-themed rounded-xl px-4 py-2.5 text-primary focus:border-electric-500 focus:ring-1 focus:ring-electric-500 outline-none transition-colors"
        />
        {errors.date && <p className="text-danger text-sm mt-1">{errors.date}</p>}
      </Card>

      {/* T1 Input */}
      <Card className="p-5 border-l-4 border-l-day-400">
        <div className="flex items-center gap-2 mb-3">
          <Sun className="w-5 h-5 text-day-500" />
          <span className="font-semibold text-primary">T1 — Дневной тариф</span>
          <span className="text-xs text-muted ml-auto">{currentTariff.t1Rate} {CURRENCY}/кВт·ч</span>
        </div>
        {prevReading && (
          <p className="text-xs text-muted mb-2">
            Предыдущее показание: <span className="font-mono text-secondary">{prevReading.t1Reading}</span>
          </p>
        )}
        <input
          type="number"
          step="0.01"
          value={t1Input}
          onChange={e => { setT1Input(e.target.value); setErrors(prev => ({ ...prev, t1: undefined })) }}
          placeholder={prevReading ? `>= ${prevReading.t1Reading}` : '0.00'}
          className="w-full bg-tertiary border border-themed rounded-xl px-4 py-3 font-mono text-xl text-primary placeholder:text-muted focus:border-day-400 focus:ring-1 focus:ring-day-400 outline-none transition-colors"
        />
        {errors.t1 && <p className="text-danger text-sm mt-1">{errors.t1}</p>}
        {preview && prevReading && (
          <div className="mt-2 text-sm">
            <span className="text-day-500 font-mono">+{preview.t1Consumption} кВт·ч</span>
            <span className="text-muted mx-2">=</span>
            <span className="text-primary font-mono">{CURRENCY}{preview.t1Cost}</span>
          </div>
        )}
      </Card>

      {/* T2 Input */}
      <Card className="p-5 border-l-4 border-l-night-500">
        <div className="flex items-center gap-2 mb-3">
          <Moon className="w-5 h-5 text-night-500" />
          <span className="font-semibold text-primary">T2 — Ночной тариф</span>
          <span className="text-xs text-muted ml-auto">{currentTariff.t2Rate} {CURRENCY}/кВт·ч</span>
        </div>
        {prevReading && (
          <p className="text-xs text-muted mb-2">
            Предыдущее показание: <span className="font-mono text-secondary">{prevReading.t2Reading}</span>
          </p>
        )}
        <input
          type="number"
          step="0.01"
          value={t2Input}
          onChange={e => { setT2Input(e.target.value); setErrors(prev => ({ ...prev, t2: undefined })) }}
          placeholder={prevReading ? `>= ${prevReading.t2Reading}` : '0.00'}
          className="w-full bg-tertiary border border-themed rounded-xl px-4 py-3 font-mono text-xl text-primary placeholder:text-muted focus:border-night-500 focus:ring-1 focus:ring-night-500 outline-none transition-colors"
        />
        {errors.t2 && <p className="text-danger text-sm mt-1">{errors.t2}</p>}
        {preview && prevReading && (
          <div className="mt-2 text-sm">
            <span className="text-night-500 font-mono">+{preview.t2Consumption} кВт·ч</span>
            <span className="text-muted mx-2">=</span>
            <span className="text-primary font-mono">{CURRENCY}{preview.t2Cost}</span>
          </div>
        )}
      </Card>

      {/* Preview Total */}
      {preview && prevReading && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <Card className="p-5 bg-electric-500/5 border-electric-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary">Итого за день</p>
                <p className="text-2xl font-bold text-primary font-mono">
                  {CURRENCY}{preview.totalCost}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">Расход</p>
                <p className="font-mono text-primary">
                  {(preview.t1Consumption + preview.t2Consumption).toFixed(2)} кВт·ч
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Submit */}
      <Button onClick={handleSubmit} size="lg" className="w-full">
        {saved ? (
          <><Check className="w-5 h-5" /> Сохранено!</>
        ) : (
          <><Zap className="w-5 h-5" /> Сохранить показание</>
        )}
      </Button>

      {/* Info about first reading */}
      {!lastReading && (
        <div className="flex gap-3 p-4 bg-electric-500/5 border border-electric-500/20 rounded-xl">
          <AlertCircle className="w-5 h-5 text-electric-500 shrink-0 mt-0.5" />
          <div className="text-sm text-secondary">
            <p className="font-medium text-primary mb-1">Первое показание</p>
            <p>Расход будет рассчитан со следующего показания. Сейчас просто введите текущие цифры с вашего счетчика.</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
