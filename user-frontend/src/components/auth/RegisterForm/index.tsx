'use client'
import Link from 'next/link'
import AuthForm from '@/common/form/AuthForm'
import { useRegisterForm } from './useRegisterForm'

export default function RegisterForm() {
  const { fields, onSubmit, loading, error, schema } = useRegisterForm()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Create account
        </h1>
        <p className="text-sm text-muted-foreground">
          Start building your link-in-bio page
        </p>
      </div>

      <AuthForm
        schema={schema}
        fields={fields}
        onSubmit={onSubmit}
        loading={loading}
        error={error}
        submitLabel="Create account"
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
