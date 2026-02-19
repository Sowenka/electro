import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Trash2, Download, Sun, Moon, Filter } from 'lucide-react'
import useReadingsStore from '../store/useReadingsStore'
import useSettingsStore from '../store/useSettingsStore'
import { exportToJSON } from '../utils/export'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { CURRENCY } from '../constants'

export default function HistoryPage() {
  const readings = useReadingsStore(s => s.readings)
  const deleteReading = useReadingsStore(s => s.deleteReading)
  const settings = useSettingsStore()
  const meterType = useSettingsStore(s => s.meterType)
  const isSingle = meterType === 'single'

  const [monthFilter, setMonthFilter] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  const sorted = useMemo(() =>
    [...readings].sort((a, b) => b.date.localeCompare(a.date)),
    [readings]
  )

  const months = useMemo(() => {
    const set = new Set(readings.map(r => r.date.slice(0, 7)))
    return [...set].sort().reverse()
  }, [readings])

  const filtered = useMemo(() => {
    if (!monthFilter) return sorted
    return sorted.filter(r => r.date.startsWith(monthFilter))
  }, [sorted, monthFilter])

  const totals = useMemo(() => ({
    t1Consumption: filtered.reduce((s, r) => s + r.t1Consumption, 0),
    t2Consumption: filtered.reduce((s, r) => s + r.t2Consumption, 0),
    t1Cost: filtered.reduce((s, r) => s + r.t1Cost, 0),
    t2Cost: filtered.reduce((s, r) => s + r.t2Cost, 0),
    totalCost: filtered.reduce((s, r) => s + r.totalCost, 0),
  }), [filtered])

  const handleDelete = () => {
    if (deleteId) {
      deleteReading(deleteId)
      setDeleteId(null)
    }
  }

  const handleExport = () => {
    exportToJSON(readings, settings)
  }

  if (readings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="text-secondary">Нет записей. Добавьте первое показание.</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
          <select
            value={monthFilter}
            onChange={e => setMonthFilter(e.target.value)}
            className="bg-tertiary border border-themed rounded-xl px-3 py-2 text-sm text-primary focus:border-electric-500 outline-none"
          >
            <option value="">Все месяцы</option>
            {months.map(m => (
              <option key={m} value={m}>
                {format(parseISO(m + '-01'), 'LLLL yyyy', { locale: ru })}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4" /> Экспорт
          </Button>
        </div>
      </div>

      {/* Summary */}
      <Card className="p-4">
        {isSingle ? (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-muted mb-1">Записей</p>
              <p className="text-lg font-bold text-primary">{filtered.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Расход</p>
              <p className="text-lg font-bold text-electric-500">
                {(totals.t1Consumption + totals.t2Consumption).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Итого</p>
              <p className="text-lg font-bold text-primary">{CURRENCY}{totals.totalCost.toFixed(2)}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-center">
            <div>
              <p className="text-xs text-muted mb-1">Записей</p>
              <p className="text-lg font-bold text-primary">{filtered.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">T1 расход</p>
              <p className="text-lg font-bold text-day-500">{totals.t1Consumption.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">T2 расход</p>
              <p className="text-lg font-bold text-night-500">{totals.t2Consumption.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">T1 стоимость</p>
              <p className="text-lg font-bold text-day-500">{CURRENCY}{totals.t1Cost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Итого</p>
              <p className="text-lg font-bold text-primary">{CURRENCY}{totals.totalCost.toFixed(2)}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-themed bg-tertiary">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase">Дата</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase">
                  {isSingle
                    ? 'Показание'
                    : <span className="flex items-center justify-end gap-1"><Sun className="w-3 h-3" /> T1</span>}
                </th>
                {!isSingle && (
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase">
                    <span className="flex items-center justify-end gap-1"><Moon className="w-3 h-3" /> T2</span>
                  </th>
                )}
                {isSingle
                  ? <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase hidden md:table-cell">Расход кВт</th>
                  : <>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase hidden md:table-cell">T1 кВт</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase hidden md:table-cell">T2 кВт</th>
                    </>}
                {!isSingle && (
                  <>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase hidden lg:table-cell">T1 {CURRENCY}</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase hidden lg:table-cell">T2 {CURRENCY}</th>
                  </>
                )}
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase">Итого</th>
                <th className="py-3 px-4 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-themed/50 hover:bg-tertiary/50 transition-colors group">
                  <td className="py-3 px-4 text-primary font-medium">
                    {format(parseISO(r.date), 'd MMM yyyy', { locale: ru })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-primary">{r.t1Reading}</td>
                  {!isSingle && <td className="py-3 px-4 text-right font-mono text-primary">{r.t2Reading}</td>}
                  {isSingle
                    ? <td className="py-3 px-4 text-right font-mono text-electric-500 hidden md:table-cell">+{r.t1Consumption}</td>
                    : <>
                        <td className="py-3 px-4 text-right font-mono text-day-500 hidden md:table-cell">+{r.t1Consumption}</td>
                        <td className="py-3 px-4 text-right font-mono text-night-500 hidden md:table-cell">+{r.t2Consumption}</td>
                      </>}
                  {!isSingle && (
                    <>
                      <td className="py-3 px-4 text-right font-mono text-day-500 hidden lg:table-cell">{r.t1Cost.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono text-night-500 hidden lg:table-cell">{r.t2Cost.toFixed(2)}</td>
                    </>
                  )}
                  <td className="py-3 px-4 text-right font-mono font-semibold text-primary">{CURRENCY}{r.totalCost.toFixed(2)}</td>
                  <td className="py-3 px-2">
                    <button
                      onClick={() => setDeleteId(r.id)}
                      className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Удалить запись?">
        <p className="text-secondary mb-4">
          Это действие нельзя отменить. Показания за последующие дни будут пересчитаны.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)} className="flex-1">
            Отмена
          </Button>
          <Button variant="danger" onClick={handleDelete} className="flex-1">
            Удалить
          </Button>
        </div>
      </Modal>
    </motion.div>
  )
}
