import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Flame, Check, AlertCircle, Zap } from 'lucide-react'
import useGasStore from '../../store/useGasStore'
import { previewGasCalculation } from '../../utils/gasCalculations'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const CURRENCY = '₽'

export default function GasReadingsPage() {
  const addReading = useGasStore(s => s.addReading)
  const readings = useGasStore(s => s.readings)
  const getLastReading = useGasStore(s => s.getLastReading)
  const getPrevReadingForDate = useGasStore(s => s.getPrevReadingForDate)
  const tariff = useGasStore(s => s.tariff)

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [input, setInput] = useState('')
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState({})

  const lastReading = useMemo(() => getLastReading(), [readings])
  const prevReading = useMemo(() => getPrevReadingForDate(date), [date, readings])
  const preview = useMemo(() => input ? previewGasCalculation(input, prevReading, tariff) : null, [input, prevReading, tariff])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    const errs = {}
    if (!date) { errs.date = 'Укажите дату' }
    else {
      const dup = readings.find(r => r.date === date)
      if (dup) errs.date = 'Показание за эту дату уже существует'
    }
    const val = parseFloat(input)
    if (isNaN(val) || input === '') errs.reading = 'Введите показание'
    else if (val < 0) errs.reading = 'Показание не может быть отрицательным'
    else if (prevReading && val < prevReading.reading) errs.reading = `Не может быть меньше предыдущего (${prevReading.reading})`

    if (Object.keys(errs).length) { setErrors(errs); return }

    addReading({ date, reading: input }, tariff)
    setInput('')
    setErrors({})
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }, [date, input, prevReading, readings, tariff, addReading])

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-4">
      <Card className="p-5">
        <label className="block text-sm font-medium text-secondary mb-2">Дата</label>
        <input
          type="date"
          value={date}
          onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: undefined })) }}
          className="w-full bg-tertiary border border-themed rounded-xl px-4 py-2.5 text-primary focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
        />
        {errors.date && <p className="text-danger text-sm mt-1">{errors.date}</p>}
      </Card>

      <Card className="p-5 border-l-4 border-l-orange-500">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-semibold text-primary">Показание счётчика</span>
          <span className="text-xs text-muted ml-auto">{tariff.rate} {CURRENCY}/м³</span>
        </div>
        {prevReading && (
          <p className="text-xs text-muted mb-2">
            Предыдущее: <span className="font-mono text-secondary">{prevReading.reading}</span>
          </p>
        )}
        <input
          type="number"
          step="0.001"
          value={input}
          onChange={e => { setInput(e.target.value); setErrors(p => ({ ...p, reading: undefined })) }}
          placeholder={prevReading ? `>= ${prevReading.reading}` : '0.000'}
          className="w-full bg-tertiary border border-themed rounded-xl px-4 py-3 font-mono text-xl text-primary placeholder:text-muted focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
        />
        {errors.reading && <p className="text-danger text-sm mt-1">{errors.reading}</p>}
        {preview && prevReading && (
          <div className="mt-2 text-sm">
            <span className="text-orange-500 font-mono">+{preview.consumption} м³</span>
            <span className="text-muted mx-2">=</span>
            <span className="text-primary font-mono">{CURRENCY}{preview.cost}</span>
          </div>
        )}
      </Card>

      {preview && prevReading && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card className="p-5 bg-orange-500/5 border-orange-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary">Итого за период</p>
                <p className="text-2xl font-bold text-primary font-mono">{CURRENCY}{preview.cost}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">Расход</p>
                <p className="font-mono text-primary">{preview.consumption} м³</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <Button onClick={handleSubmit} size="lg" className="w-full">
        {saved ? <><Check className="w-5 h-5" /> Сохранено!</> : <><Zap className="w-5 h-5" /> Сохранить показание</>}
      </Button>

      {!lastReading && (
        <div className="flex gap-3 p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
          <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <div className="text-sm text-secondary">
            <p className="font-medium text-primary mb-1">Первое показание</p>
            <p>Расход будет рассчитан со следующего показания. Введите текущую цифру с вашего счётчика.</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
