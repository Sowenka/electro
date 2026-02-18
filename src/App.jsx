import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import ReadingsPage from './pages/ReadingsPage'
import HistoryPage from './pages/HistoryPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import { useTheme } from './hooks/useTheme'

export default function App() {
  useTheme()

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/readings" element={<ReadingsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
