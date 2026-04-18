'use client'
import { useForm, SubmitHandler, DefaultValues, Path, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ZodSchema } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface FieldConfig<T> {
  name: Path<T>
  label: string
  type?: string
  placeholder?: string
  hint?: string
  required?: boolean
}

interface AuthFormProps<T extends FieldValues> {
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

export function AuthForm<T extends FieldValues>({
  schema,
  fields,
  onSubmit,
  defaultValues,
  submitLabel = 'Submit',
  loading = false,
  error,
  className,
  children,
}: AuthFormProps<T>) {
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
        <div key={String(field.name)} className="space-y-2">
          <Label htmlFor={String(field.name)} className="text-sm font-medium text-foreground/80">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            id={String(field.name)}
            type={field.type || 'text'}
            placeholder={field.placeholder}
            className={cn(
              'h-11 bg-muted/50 border-muted-foreground/20',
              'focus-visible:ring-primary/30 focus-visible:border-primary/50',
              'placeholder:text-muted-foreground/40',
              errors[field.name] && 'border-destructive/60 focus-visible:ring-destructive/30'
            )}
            {...register(field.name)}
          />
          {errors[field.name] && (
            <p className="text-xs text-destructive">{errors[field.name]?.message as string}</p>
          )}
          {field.hint && !errors[field.name] && (
            <p className="text-xs text-muted-foreground">{field.hint}</p>
          )}
        </div>
      ))}

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {children}

      <Button
        type="submit"
        disabled={loading}
        className={cn(
          'w-full h-11 text-sm font-semibold',
          'bg-primary hover:bg-primary/90',
          'shadow-lg shadow-primary/25 hover:shadow-primary/40',
          'transition-all duration-200'
        )}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Please wait...</span>
          </div>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  )
}

export default AuthForm
