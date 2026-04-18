import LoginForm from '@/components/auth/LoginForm'
import AuthLayout from '../_layout/AuthLayout'

export const metadata = { title: 'Sign in — Phachankoun' }

export default function LoginPage() {
  return (
    <AuthLayout
      panel={
        <div className="flex flex-col gap-6">
          <h2 className="text-3xl font-semibold text-primary-foreground leading-tight">
            The link in bio tool built for creators
          </h2>
          <p className="text-primary-foreground/70 text-base leading-relaxed">
            One beautiful page for everything you create, share, and sell. Build your audience, grow your brand.
          </p>
          <div className="flex items-center justify-center gap-8 pt-4">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-primary-foreground">10K+</span>
              <span className="text-xs text-primary-foreground/50 uppercase tracking-wider">Creators</span>
            </div>
            <div className="h-10 w-px bg-primary-foreground/15" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-primary-foreground">50M+</span>
              <span className="text-xs text-primary-foreground/50 uppercase tracking-wider">Link clicks</span>
            </div>
            <div className="h-10 w-px bg-primary-foreground/15" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-primary-foreground">99.9%</span>
              <span className="text-xs text-primary-foreground/50 uppercase tracking-wider">Uptime</span>
            </div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </AuthLayout>
  )
}
