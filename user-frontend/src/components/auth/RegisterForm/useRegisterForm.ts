import { useAuth } from '@/hooks/useAuth'
import { registerSchema, type RegisterSchema } from '@/lib/validations/auth.schema'
import type { FieldConfig } from '@/common/form/AuthForm'

export function useRegisterForm() {
  const { register: registerUser, loading, error } = useAuth()

  const fields: FieldConfig<RegisterSchema>[] = [
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
      placeholder: 'Create a password',
      hint: 'Min 8 chars, one uppercase, one number',
      required: true,
    },
  ]

  const onSubmit = async (data: RegisterSchema) => {
    await registerUser(data.email, data.password)
  }

  return { fields, onSubmit, loading, error, schema: registerSchema }
}
