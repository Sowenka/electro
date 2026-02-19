import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Monitor, Save, Download, Upload, Trash2, AlertCircle, Check, Zap, Gauge } from 'lucide-react'
import useSettingsStore from '../store/useSettingsStore'
import useReadingsStore from '../store/useReadingsStore'
import { exportToJSON, importFromJSON } from '../utils/export'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CURRENCY } from '../constants'

export default function SettingsPage() {
  const { theme, setTheme, currentTariff, updateTariff, tariffHistory, meterType, setMeterType } = useSettingsStore()
  const readings = useReadingsStore(s => s.readings)
  const importReadings = useReadingsStore(s => s.importReadings)
  const clearReadings = useReadingsStore(s => s.clearReadings)
  const importSettings = useSettingsStore(s => s.importSettings)

  const [t1Rate, setT1Rate] = useState(String(currentTariff.t1Rate))
  const [t2Rate, setT2Rate] = useState(String(currentTariff.t2Rate))
  const [tariffSaved, setTariffSaved] = useState(false)
  const [showClear, setShowClear] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const fileRef = useRef(null)
  const [lastBackup, setLastBackup] = useState(() => localStorage.getItem('electro-last-backup'))

  const isSingle = meterType === 'single'

  const handleTariffSave = () => {
    const t1 = parseFloat(t1Rate)
    if (isNaN(t1) || t1 <= 0) return
    if (!isSingle) {
      const t2 = parseFloat(t2Rate)
      if (isNaN(t2) || t2 <= 0) return
      updateTariff(t1, t2)
    } else {
      updateTariff(t1, 0)
    }
    setTariffSaved(true)
    setTimeout(() => setTariffSaved(false), 2000)
  }

  const handleExport = () => {
    const settings = useSettingsStore.getState()
    exportToJSON(readings, settings)
    const now = new Date().toISOString()
    localStorage.setItem('electro-last-backup', now)
    setLastBackup(now)
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = await importFromJSON(file)
      if (data.readings) importReadings(data.readings)
      if (data.settings) importSettings(data.settings)
      setImportMsg(`Импортировано ${data.readings?.length || 0} записей`)
      setTimeout(() => setImportMsg(''), 3000)
    } catch (err) {
      setImportMsg(`Ошибка: ${err.message}`)
      setTimeout(() => setImportMsg(''), 5000)
    }
    e.target.value = ''
  }

  const handleClear = () => {
    clearReadings()
    setShowClear(false)
  }

  const themes = [
    { key: 'light', icon: Sun, label: 'Светлая' },
    { key: 'dark', icon: Moon, label: 'Тёмная' },
    { key: 'system', icon: Monitor, label: 'Системная' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto space-y-4">
      {/* Meter Type */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-primary mb-3">Тип счётчика</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMeterType('single')}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
              isSingle
                ? 'bg-electric-500/10 text-electric-500 border border-electric-500/30'
                : 'bg-tertiary text-secondary hover:text-primary border border-transparent'
            }`}
          >
            <Gauge className="w-5 h-5" />
            <span className="text-xs font-medium text-center">Однозонный</span>
          </button>
          <button
            onClick={() => setMeterType('two-zone')}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
              !isSingle
                ? 'bg-electric-500/10 text-electric-500 border border-electric-500/30'
                : 'bg-tertiary text-secondary hover:text-primary border border-transparent'
            }`}
          >
            <div className="flex gap-1">
              <Sun className="w-4 h-4" />
              <Moon className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-center">Двухзонный (T1/T2)</span>
          </button>
        </div>
      </Card>

      {/* Theme */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-primary mb-3">Тема оформления</h3>
        <div className="grid grid-cols-3 gap-2">
          {themes.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                theme === key
                  ? 'bg-electric-500/10 text-electric-500 border border-electric-500/30'
                  : 'bg-tertiary text-secondary hover:text-primary border border-transparent'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Tariff */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-primary mb-3">Тарифы</h3>
        {isSingle ? (
          <div className="mb-4">
            <label className="flex items-center gap-1.5 text-xs text-muted mb-1.5">
              <Zap className="w-3.5 h-3.5 text-electric-500" /> Тариф, {CURRENCY}/кВт·ч
            </label>
            <input
              type="number"
              step="0.01"
              value={t1Rate}
              onChange={e => setT1Rate(e.target.value)}
              className="w-full bg-tertiary border border-themed rounded-xl px-3 py-2.5 font-mono text-primary focus:border-electric-500 focus:ring-1 focus:ring-electric-500 outline-none"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs text-muted mb-1.5">
                <Sun className="w-3.5 h-3.5 text-day-500" /> T1 (день), {CURRENCY}/кВт·ч
              </label>
              <input
                type="number"
                step="0.01"
                value={t1Rate}
                onChange={e => setT1Rate(e.target.value)}
                className="w-full bg-tertiary border border-themed rounded-xl px-3 py-2.5 font-mono text-primary focus:border-electric-500 focus:ring-1 focus:ring-electric-500 outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs text-muted mb-1.5">
                <Moon className="w-3.5 h-3.5 text-night-500" /> T2 (ночь), {CURRENCY}/кВт·ч
              </label>
              <input
                type="number"
                step="0.01"
                value={t2Rate}
                onChange={e => setT2Rate(e.target.value)}
                className="w-full bg-tertiary border border-themed rounded-xl px-3 py-2.5 font-mono text-primary focus:border-electric-500 focus:ring-1 focus:ring-electric-500 outline-none"
              />
            </div>
          </div>
        )}
        <Button onClick={handleTariffSave} size="sm">
          {tariffSaved ? <><Check className="w-4 h-4" /> Сохранено</> : <><Save className="w-4 h-4" /> Сохранить тариф</>}
        </Button>

        {tariffHistory.length > 0 && (
          <div className="mt-4 pt-4 border-t border-themed">
            <p className="text-xs text-muted mb-2">История тарифов</p>
            <div className="space-y-1">
              {tariffHistory.slice(-5).reverse().map(p => (
                <div key={p.id} className="flex items-center justify-between text-xs">
                  <span className="text-secondary">{p.startDate}</span>
                  <span className="font-mono text-primary">
                    {p.t2Rate > 0 ? `T1: ${p.t1Rate} / T2: ${p.t2Rate}` : `${p.t1Rate} ${CURRENCY}/кВт·ч`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Data Management */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-primary mb-3">Данные</h3>
        <div className="text-xs text-muted mb-4 space-y-1">
          <p>Всего записей: {readings.length}</p>
          <p>Последний бэкап: {lastBackup ? format(new Date(lastBackup), 'd MMM yyyy, HH:mm', { locale: ru }) : 'не выполнялся'}</p>
        </div>

        <div className="space-y-2">
          <Button variant="secondary" size="sm" onClick={handleExport} className="w-full">
            <Download className="w-4 h-4" /> Экспорт в JSON
          </Button>

          <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} className="w-full">
            <Upload className="w-4 h-4" /> Импорт из JSON
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          {importMsg && (
            <p className={`text-sm p-2 rounded-lg ${importMsg.startsWith('Ошибка') ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
              {importMsg}
            </p>
          )}

          <Button variant="danger" size="sm" onClick={() => setShowClear(true)} className="w-full">
            <Trash2 className="w-4 h-4" /> Очистить все данные
          </Button>
        </div>
      </Card>

      {/* About */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-electric-500/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-electric-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary">Электро</h3>
            <p className="text-xs text-muted">Версия 1.0.0</p>
          </div>
        </div>
        <p className="text-xs text-secondary">
          Учёт показаний электросчётчика. Данные хранятся локально в вашем браузере.
        </p>
      </Card>

      {/* Clear Modal */}
      <Modal isOpen={showClear} onClose={() => setShowClear(false)} title="Очистить все данные?">
        <div className="flex gap-3 p-3 bg-danger/5 rounded-xl mb-4">
          <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          <p className="text-sm text-secondary">
            Все показания ({readings.length} записей) будут удалены безвозвратно. Рекомендуем сначала сделать экспорт.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowClear(false)} className="flex-1">
            Отмена
          </Button>
          <Button variant="danger" onClick={handleClear} className="flex-1">
            Удалить всё
          </Button>
        </div>
      </Modal>
    </motion.div>
  )
}
