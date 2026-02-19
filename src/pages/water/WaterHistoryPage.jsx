import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Trash2, Filter, Droplets, Thermometer } from 'lucide-react'
import useWaterStore from '../../store/useWaterStore'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

const CURRENCY = '₽'

export default function WaterHistoryPage() {
  const readings = useWaterStore(s => s.readings)
  const deleteReading = useWaterStore(s => s.deleteReading)

  const [monthFilter, setMonthFilter] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  const sorted = useMemo(() => [...readings].sort((a, b) => b.date.localeCompare(a.date)), [readings])
  const months = useMemo(() => {
    const set = new Set(readings.map(r => r.date.slice(0, 7)))
    return [...set].sort().reverse()
  }, [readings])

  const filtered = useMemo(() =>
    monthFilter ? sorted.filter(r => r.date.startsWith(monthFilter)) : sorted,
    [sorted, monthFilter]
  )

  const totals = useMemo(() => ({
    cold: filtered.reduce((s, r) => s + r.coldConsumption, 0),
    hot: filtered.reduce((s, r) => s + r.hotConsumption, 0),
    coldCost: filtered.reduce((s, r) => s + r.coldCost, 0),
    hotCost: filtered.reduce((s, r) => s + r.hotCost, 0),
    total: filtered.reduce((s, r) => s + r.totalCost, 0),
  }), [filtered])

  if (readings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="text-secondary">Нет записей. Добавьте первое показание.</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
          <select
            value={monthFilter}
            onChange={e => setMonthFilter(e.target.value)}
            className="bg-tertiary border border-themed rounded-xl px-3 py-2 text-sm text-primary focus:border-blue-400 outline-none"
          >
            <option value="">Все месяцы</option>
            {months.map(m => (
              <option key={m} value={m}>{format(parseISO(m + '-01'), 'LLLL yyyy', { locale: ru })}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary */}
      <Card className="p-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-center">
          <div>
            <p className="text-xs text-muted mb-1">Записей</p>
            <p className="text-lg font-bold text-primary">{filtered.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">ХВС м³</p>
            <p className="text-lg font-bold text-blue-400">{totals.cold.toFixed(3)}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">ГВС м³</p>
            <p className="text-lg font-bold text-orange-400">{totals.hot.toFixed(3)}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">ХВС {CURRENCY}</p>
            <p className="text-lg font-bold text-blue-400">{CURRENCY}{totals.coldCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Итого</p>
            <p className="text-lg font-bold text-primary">{CURRENCY}{totals.total.toFixed(2)}</p>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-themed bg-tertiary">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase">Дата</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase">
                  <span className="flex items-center justify-end gap-1"><Droplets className="w-3 h-3" /> ХВС</span>
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase">
                  <span className="flex items-center justify-end gap-1"><Thermometer className="w-3 h-3" /> ГВС</span>
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase hidden md:table-cell">ХВС м³</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase hidden md:table-cell">ГВС м³</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase hidden lg:table-cell">ХВС {CURRENCY}</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase hidden lg:table-cell">ГВС {CURRENCY}</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase">Итого</th>
                <th className="py-3 px-4 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-themed/50 hover:bg-tertiary/50 transition-colors group">
                  <td className="py-3 px-4 text-primary font-medium">{format(parseISO(r.date), 'd MMM yyyy', { locale: ru })}</td>
                  <td className="py-3 px-4 text-right font-mono text-primary">{r.coldReading}</td>
                  <td className="py-3 px-4 text-right font-mono text-primary">{r.hotReading}</td>
                  <td className="py-3 px-4 text-right font-mono text-blue-400 hidden md:table-cell">+{r.coldConsumption}</td>
                  <td className="py-3 px-4 text-right font-mono text-orange-400 hidden md:table-cell">+{r.hotConsumption}</td>
                  <td className="py-3 px-4 text-right font-mono text-blue-400 hidden lg:table-cell">{r.coldCost.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono text-orange-400 hidden lg:table-cell">{r.hotCost.toFixed(2)}</td>
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

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Удалить запись?">
        <p className="text-secondary mb-4">Это действие нельзя отменить. Последующие записи будут пересчитаны.</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)} className="flex-1">Отмена</Button>
          <Button variant="danger" onClick={() => { deleteReading(deleteId); setDeleteId(null) }} className="flex-1">Удалить</Button>
        </div>
      </Modal>
    </motion.div>
  )
}
