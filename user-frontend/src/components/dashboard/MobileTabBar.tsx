'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wallet, Users, Plus, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/dashboard', label: 'Home', icon: Home, exact: true },
  { href: '/dashboard/clients', label: 'Clients', icon: Users, exact: false },
  { href: '/dashboard/invoices', label: 'Invoices', icon: Wallet, exact: false },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, exact: false },
]

export function MobileTabBar() {
  const pathname = usePathname()

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden h-16 bg-card border-t border-border flex items-center">
      {/* Left 2 tabs */}
      {TABS.slice(0, 2).map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(href, exact)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 h-full transition-all duration-150',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}

      {/* Center "Add" button */}
      <div className="flex-1 flex items-center justify-center">
        <Link
          href="/dashboard/invoices/new"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 transition-all duration-150 hover:scale-105 active:scale-95"
          title="Create New Invoice"
        >
          <Plus className="h-5 w-5 text-primary-foreground" />
        </Link>
      </div>

      {/* Right 2 tabs */}
      {TABS.slice(2).map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(href, exact)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 h-full transition-all duration-150',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
