'use client'
import { useForm, SubmitHandler, DefaultValues, Path, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ZodSchema } from 'zod'
import FormInput from './FormInput'
import { cn } from '@/lib/utils'
 
export interface FieldConfig<T> {
  name: Path<T>
  label: string
  type?: string
  placeholder?: string
  hint?: string
  required?: boolean
}
 
interface CommonFormProps<T extends FieldValues> {
  schema: ZodSchema<T>
  fields: FieldConfig<T>[]
  onSubmit: SubmitHandler<T>
  defaultValues?: DefaultValues<T>
  submitLabel?: string
  loading?: boolean
  error?: string | null
  className?: string
  children?: React.ReactNode
}
 
export function CommonForm<T extends FieldValues>({
  schema,
  fields,
  onSubmit,
  defaultValues,
  submitLabel = 'Submit',
  loading = false,
  error,
  className,
  children,
}: CommonFormProps<T>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues,
  })
 
  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-4', className)}>
      {fields.map((field) => (
        <FormInput
          key={String(field.name)}
          label={field.label}
          type={field.type || 'text'}
          placeholder={field.placeholder}
          hint={field.hint}
          required={field.required}
          error={errors[field.name]?.message as string}
          {...register(field.name)}
        />
      ))}
 
      {error && (
        <div className="form-error-banner">
          <span>{error}</span>
        </div>
      )}
 
      {children}
 
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? <span className="btn-spinner" /> : submitLabel}
      </button>
    </form>
  )
}
 
export default CommonForm
