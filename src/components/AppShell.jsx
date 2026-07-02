import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#E9E4D6] font-body">
      <Sidebar />
      <div className="md:ml-64">
        <main className="w-full max-w-3xl mx-auto pb-24 md:pb-12">{children}</main>
      </div>
      <BottomNav />
    </div>
  )
}
