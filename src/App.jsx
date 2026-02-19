import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ResourceLayout from './components/layout/ResourceLayout'
import DashboardPage from './pages/DashboardPage'
import ReadingsPage from './pages/ReadingsPage'
import HistoryPage from './pages/HistoryPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import WaterReadingsPage from './pages/water/WaterReadingsPage'
import WaterHistoryPage from './pages/water/WaterHistoryPage'
import WaterAnalyticsPage from './pages/water/WaterAnalyticsPage'
import GasReadingsPage from './pages/gas/GasReadingsPage'
import GasHistoryPage from './pages/gas/GasHistoryPage'
import GasAnalyticsPage from './pages/gas/GasAnalyticsPage'
import { useTheme } from './hooks/useTheme'
import BackupReminder from './components/ui/BackupReminder'

export default function App() {
  useTheme()

  useEffect(() => {
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist()
    }
  }, [])

  return (
    <>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Electricity */}
          <Route path="/electricity" element={<ResourceLayout basePath="electricity" />}>
            <Route index element={<Navigate to="/electricity/readings" replace />} />
            <Route path="readings" element={<ReadingsPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>

          {/* Water */}
          <Route path="/water" element={<ResourceLayout basePath="water" />}>
            <Route index element={<Navigate to="/water/readings" replace />} />
            <Route path="readings" element={<WaterReadingsPage />} />
            <Route path="history" element={<WaterHistoryPage />} />
            <Route path="analytics" element={<WaterAnalyticsPage />} />
          </Route>

          {/* Gas */}
          <Route path="/gas" element={<ResourceLayout basePath="gas" />}>
            <Route index element={<Navigate to="/gas/readings" replace />} />
            <Route path="readings" element={<GasReadingsPage />} />
            <Route path="history" element={<GasHistoryPage />} />
            <Route path="analytics" element={<GasAnalyticsPage />} />
          </Route>

          <Route path="/settings" element={<SettingsPage />} />

          {/* Legacy redirects */}
          <Route path="/readings" element={<Navigate to="/electricity/readings" replace />} />
          <Route path="/history" element={<Navigate to="/electricity/history" replace />} />
          <Route path="/analytics" element={<Navigate to="/electricity/analytics" replace />} />
        </Route>
      </Routes>
      <BackupReminder />
    </>
  )
}
