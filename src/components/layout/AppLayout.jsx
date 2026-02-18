import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import TopBar from './TopBar'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
