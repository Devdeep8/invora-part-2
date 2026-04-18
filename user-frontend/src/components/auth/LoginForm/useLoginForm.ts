import { useAuth } from '@/hooks/useAuth'
import { loginSchema, type LoginSchema } from '@/lib/validations/auth.schema'
import type { FieldConfig } from '@/common/form/AuthForm'

export function useLoginForm() {
  const { login, loading, error } = useAuth()

  const fields: FieldConfig<LoginSchema>[] = [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'you@example.com',
      required: true,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Enter your password',
      required: true,
    },
  ]

  const onSubmit = async (data: LoginSchema) => {
    await login(data.email, data.password)
  }

  return { fields, onSubmit, loading, error, schema: loginSchema }
}
