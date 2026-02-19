import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, ShieldAlert } from 'lucide-react'
import useReadingsStore from '../../store/useReadingsStore'
import useSettingsStore from '../../store/useSettingsStore'
import { exportToJSON } from '../../utils/export'

const BACKUP_INTERVAL_DAYS = 7
const STORAGE_KEY = 'electro-last-backup'

export default function BackupReminder() {
  const [show, setShow] = useState(false)
  const readings = useReadingsStore(s => s.readings)

  useEffect(() => {
    if (readings.length < 5) return

    const lastBackup = localStorage.getItem(STORAGE_KEY)
    if (!lastBackup) {
      setShow(true)
      return
    }

    const daysSince = (Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSince >= BACKUP_INTERVAL_DAYS) {
      setShow(true)
    }
  }, [readings.length])

  const handleBackup = () => {
    const settings = useSettingsStore.getState()
    exportToJSON(readings, settings)
    localStorage.setItem(STORAGE_KEY, new Date().toISOString())
    setShow(false)
  }

  const handleDismiss = () => {
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-96 z-50"
        >
          <div className="bg-secondary border border-themed rounded-2xl shadow-card-hover p-4">
            <div className="flex gap-3">
              <div className="p-2 rounded-xl bg-day-400/10 shrink-0 h-fit">
                <ShieldAlert className="w-5 h-5 text-day-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary mb-1">Сделайте резервную копию</p>
                <p className="text-xs text-secondary mb-3">
                  Данные хранятся только в браузере. При очистке истории они пропадут. Экспортируйте копию для сохранности.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleBackup}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-electric-500 hover:bg-electric-600 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Скачать копию
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1.5 text-xs text-muted hover:text-secondary transition-colors"
                  >
                    Позже
                  </button>
                </div>
              </div>
              <button onClick={handleDismiss} className="text-muted hover:text-secondary shrink-0 h-fit">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
