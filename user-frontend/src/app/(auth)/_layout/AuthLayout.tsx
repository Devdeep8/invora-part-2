import { ReactNode } from 'react'
import { Link2 } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
  panel: ReactNode
}

export default function AuthLayout({ children, panel }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left — branding panel */}
      <div className="hidden lg:flex relative flex-col items-center justify-center bg-primary p-12 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-primary-foreground/10 blur-3xl" />

        <div className="relative z-10 max-w-md text-center">
          <div className="mb-8 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm">
            <Link2 className="h-8 w-8 text-primary-foreground" />
          </div>
          {panel}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 sm:p-8 bg-background">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center justify-center gap-2">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary">
              <Link2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">Phachankoun</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
