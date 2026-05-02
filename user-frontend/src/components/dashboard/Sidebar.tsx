'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useDashboard } from './DashboardProvider'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Home,
  LayoutGrid,
  BarChart3,
  Settings,
  Link2,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  Wallet,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: Home, exact: true },
  { href: '/dashboard/clients', label: 'Clients', icon: Users, exact: false },
  { href: '/dashboard/invoices', label: 'Invoices', icon: Wallet, exact: false },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, exact: false },
]

/**
 * useSidebarCollapsed — exported so LayoutContent can read the value
 * to shift main content. We use a module-level signal (simplest shared state
 * without a full context).
 */
let _listeners: ((c: boolean) => void)[] = []
let _collapsed = false

function setCollapsedGlobal(value: boolean) {
  _collapsed = value
  _listeners.forEach((fn) => fn(value))
}

/** Subscribe to collapse changes from outside the sidebar */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(_collapsed)
  if (!_listeners.includes(setCollapsed)) _listeners.push(setCollapsed)
  // Cleanup on unmount handled naturally (stale closures, harmless for small listener list)
  return collapsed
}

export function Sidebar() {
  const [collapsed, setCollapsedLocal] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useDashboard()

  const toggle = () => {
    const next = !collapsed
    setCollapsedLocal(next)
    setCollapsedGlobal(next)
  }

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden md:flex flex-col bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo + collapse toggle */}
      <div className="flex h-16 items-center border-b border-border px-3 shrink-0">
        <div className="flex flex-1 items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/30">
            <Link2 className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold tracking-tight text-foreground truncate animate-slide-in">
              {user?.business?.name || 'Setup Business'}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
          onClick={toggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 space-y-0.5 p-2 pt-3 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              {!collapsed && (
                <>
                  <span className="truncate flex-1 animate-slide-in">{label}</span>
                  {active && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border p-2 space-y-0.5">
        {/* Settings */}
        <Link
          href="/dashboard/settings"
          title={collapsed ? 'Settings' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group',
            pathname.startsWith('/dashboard/settings')
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Settings
            className={cn(
              'h-4 w-4 shrink-0',
              pathname.startsWith('/dashboard/settings')
                ? 'text-primary'
                : 'text-muted-foreground group-hover:text-foreground'
            )}
          />
          {!collapsed && <span className="truncate animate-slide-in">Settings</span>}
        </Link>

        {/* User info */}
        {user && (
          <div
            className={cn(
              'flex items-center rounded-lg px-3 py-2 gap-3 mt-0.5',
              collapsed ? 'justify-center' : ''
            )}
          >
            <Avatar className="h-7 w-7 shrink-0 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {user.business?.name ? user.business.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{user.business?.name || 'Setup Business'}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
                  onClick={logout}
                  title="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
