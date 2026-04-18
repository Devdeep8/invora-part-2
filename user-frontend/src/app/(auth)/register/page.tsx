import RegisterForm from '@/components/auth/RegisterForm'
import AuthLayout from '../_layout/AuthLayout'

export const metadata = { title: 'Create account — Phachankoun' }

export default function RegisterPage() {
  return (
    <AuthLayout
      panel={
        <div className="flex flex-col gap-6">
          <h2 className="text-3xl font-semibold text-primary-foreground leading-tight">
            Everything you are, in one simple link
          </h2>
          <p className="text-primary-foreground/70 text-base leading-relaxed">
            Build your personal page in minutes. Share it everywhere. No design skills needed.
          </p>
          <ul className="flex flex-col gap-3 pt-2 text-left text-primary-foreground/80 text-sm">
            <li className="flex items-center gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
                <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Custom slug & personal branding
            </li>
            <li className="flex items-center gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
                <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Unlimited links
            </li>
            <li className="flex items-center gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
                <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Analytics & click tracking
            </li>
            <li className="flex items-center gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
                <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Beautiful themes
            </li>
          </ul>
        </div>
      }
    >
      <RegisterForm />
    </AuthLayout>
  )
}
