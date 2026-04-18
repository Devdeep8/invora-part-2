'use client'
import { DashboardProvider, useDashboard } from '@/components/dashboard/DashboardProvider'
import { Sidebar, useSidebarCollapsed } from '@/components/dashboard/Sidebar'
import { MobileTabBar } from '@/components/dashboard/MobileTabBar'
import { cn } from '@/lib/utils'

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { loading } = useDashboard()
  const sidebarCollapsed = useSidebarCollapsed()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Loading your studio…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar — manages its own collapse toggle */}
      <Sidebar />

      {/* Main content: shifts left margin when sidebar collapses */}
      <main
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'md:pl-16' : 'md:pl-64',
          'pb-20 md:pb-0'
        )}
      >
        <div className="max-w-5xl mx-auto p-4 md:p-6 animate-fade-up">
          {children}
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <MobileTabBar />
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <LayoutContent>{children}</LayoutContent>
    </DashboardProvider>
  )
}
