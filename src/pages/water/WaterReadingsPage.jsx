import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Droplets, Thermometer, Check, AlertCircle, Zap } from 'lucide-react'
import useWaterStore from '../../store/useWaterStore'
import { previewWaterCalculation } from '../../utils/waterCalculations'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const CURRENCY = '₽'

export default function WaterReadingsPage() {
  const addReading = useWaterStore(s => s.addReading)
  const readings = useWaterStore(s => s.readings)
  const getLastReading = useWaterStore(s => s.getLastReading)
  const getPrevReadingForDate = useWaterStore(s => s.getPrevReadingForDate)
  const tariff = useWaterStore(s => s.tariff)

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [coldInput, setColdInput] = useState('')
  const [hotInput, setHotInput] = useState('')
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState({})

  const lastReading = useMemo(() => getLastReading(), [readings])
  const prevReading = useMemo(() => getPrevReadingForDate(date), [date, readings])

  const preview = useMemo(() => {
    if (!coldInput && !hotInput) return null
    return previewWaterCalculation(coldInput, hotInput, prevReading, tariff)
  }, [coldInput, hotInput, prevReading, tariff])

  const validate = useCallback(() => {
    const errs = {}
    if (!date) { errs.date = 'Укажите дату' }
    else {
      const dup = readings.find(r => r.date === date)
      if (dup) errs.date = 'Показание за эту дату уже существует'
    }
    const cold = parseFloat(coldInput)
    if (isNaN(cold) || coldInput === '') errs.cold = 'Введите показание ХВС'
    else if (cold < 0) errs.cold = 'Показание не может быть отрицательным'
    else if (prevReading && cold < prevReading.coldReading) errs.cold = `Не может быть меньше предыдущего (${prevReading.coldReading})`

    const hot = parseFloat(hotInput)
    if (isNaN(hot) || hotInput === '') errs.hot = 'Введите показание ГВС'
    else if (hot < 0) errs.hot = 'Показание не может быть отрицательным'
    else if (prevReading && hot < prevReading.hotReading) errs.hot = `Не может быть меньше предыдущего (${prevReading.hotReading})`

    return errs
  }, [date, coldInput, hotInput, prevReading, readings])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    addReading({ date, coldReading: coldInput, hotReading: hotInput }, tariff)
    setColdInput('')
    setHotInput('')
    setErrors({})
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }, [date, coldInput, hotInput, tariff, addReading, validate])

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-4">
      {/* Date */}
      <Card className="p-5">
        <label className="block text-sm font-medium text-secondary mb-2">Дата</label>
        <input
          type="date"
          value={date}
          onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: undefined })) }}
          className="w-full bg-tertiary border border-themed rounded-xl px-4 py-2.5 text-primary focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-colors"
        />
        {errors.date && <p className="text-danger text-sm mt-1">{errors.date}</p>}
      </Card>

      {/* Cold water */}
      <Card className="p-5 border-l-4 border-l-blue-400">
        <div className="flex items-center gap-2 mb-3">
          <Droplets className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-primary">ХВС — Холодная вода</span>
          <span className="text-xs text-muted ml-auto">{tariff.coldRate} {CURRENCY}/м³</span>
        </div>
        {prevReading && (
          <p className="text-xs text-muted mb-2">
            Предыдущее: <span className="font-mono text-secondary">{prevReading.coldReading}</span>
          </p>
        )}
        <input
          type="number"
          step="0.001"
          value={coldInput}
          onChange={e => { setColdInput(e.target.value); setErrors(p => ({ ...p, cold: undefined })) }}
          placeholder={prevReading ? `>= ${prevReading.coldReading}` : '0.000'}
          className="w-full bg-tertiary border border-themed rounded-xl px-4 py-3 font-mono text-xl text-primary placeholder:text-muted focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-colors"
        />
        {errors.cold && <p className="text-danger text-sm mt-1">{errors.cold}</p>}
        {preview && prevReading && (
          <div className="mt-2 text-sm">
            <span className="text-blue-400 font-mono">+{preview.coldConsumption} м³</span>
            <span className="text-muted mx-2">=</span>
            <span className="text-primary font-mono">{CURRENCY}{preview.coldCost}</span>
          </div>
        )}
      </Card>

      {/* Hot water */}
      <Card className="p-5 border-l-4 border-l-orange-400">
        <div className="flex items-center gap-2 mb-3">
          <Thermometer className="w-5 h-5 text-orange-400" />
          <span className="font-semibold text-primary">ГВС — Горячая вода</span>
          <span className="text-xs text-muted ml-auto">{tariff.hotRate} {CURRENCY}/м³</span>
        </div>
        {prevReading && (
          <p className="text-xs text-muted mb-2">
            Предыдущее: <span className="font-mono text-secondary">{prevReading.hotReading}</span>
          </p>
        )}
        <input
          type="number"
          step="0.001"
          value={hotInput}
          onChange={e => { setHotInput(e.target.value); setErrors(p => ({ ...p, hot: undefined })) }}
          placeholder={prevReading ? `>= ${prevReading.hotReading}` : '0.000'}
          className="w-full bg-tertiary border border-themed rounded-xl px-4 py-3 font-mono text-xl text-primary placeholder:text-muted focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none transition-colors"
        />
        {errors.hot && <p className="text-danger text-sm mt-1">{errors.hot}</p>}
        {preview && prevReading && (
          <div className="mt-2 text-sm">
            <span className="text-orange-400 font-mono">+{preview.hotConsumption} м³</span>
            <span className="text-muted mx-2">=</span>
            <span className="text-primary font-mono">{CURRENCY}{preview.hotCost}</span>
          </div>
        )}
      </Card>

      {/* Preview total */}
      {preview && prevReading && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card className="p-5 bg-blue-500/5 border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary">Итого за день</p>
                <p className="text-2xl font-bold text-primary font-mono">{CURRENCY}{preview.totalCost}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">Расход</p>
                <p className="font-mono text-primary">
                  {(preview.coldConsumption + preview.hotConsumption).toFixed(3)} м³
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <Button onClick={handleSubmit} size="lg" className="w-full">
        {saved ? <><Check className="w-5 h-5" /> Сохранено!</> : <><Zap className="w-5 h-5" /> Сохранить показание</>}
      </Button>

      {!lastReading && (
        <div className="flex gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
          <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-secondary">
            <p className="font-medium text-primary mb-1">Первое показание</p>
            <p>Расход будет рассчитан со следующего показания. Введите текущие цифры с ваших счётчиков.</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
