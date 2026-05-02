'use client'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useForm, SubmitHandler, DefaultValues, Path, FieldValues, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ZodSchema } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface FieldConfig<T> {
  name: Path<T>
  label: string
  type?: string
  placeholder?: string
  hint?: string
  required?: boolean
  options?: { label: string; value: string }[]
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
    control,
    formState: { errors },
  } = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues,
  })

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  const togglePassword = (name: string) => {
    setShowPasswords((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-4', className)}>
      {fields.map((field) => (
        <div key={String(field.name)} className="space-y-2">
          <Label htmlFor={String(field.name)} className="text-sm font-medium text-foreground/80">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {field.type === 'select' ? (
            <Controller
              control={control}
              name={field.name}
              render={({ field: controllerField }) => (
                <Select onValueChange={controllerField.onChange} defaultValue={controllerField.value}>
                  <SelectTrigger
                    id={String(field.name)}
                    className={cn(
                      'h-11 bg-muted/50 border-muted-foreground/20',
                      'focus:ring-primary/30 focus:border-primary/50',
                      errors[field.name] && 'border-destructive/60 focus:ring-destructive/30'
                    )}
                  >
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          ) : (
            <div className="relative">
              <Input
                id={String(field.name)}
                type={field.type === 'password' ? (showPasswords[String(field.name)] ? 'text' : 'password') : (field.type || 'text')}
                placeholder={field.placeholder}
                className={cn(
                  'h-11 bg-muted/50 border-muted-foreground/20',
                  'focus-visible:ring-primary/30 focus-visible:border-primary/50',
                  'placeholder:text-muted-foreground/40',
                  field.type === 'password' && 'pr-10',
                  errors[field.name] && 'border-destructive/60 focus-visible:ring-destructive/30'
                )}
                {...register(field.name)}
              />
              {field.type === 'password' && (
                <button
                  type="button"
                  onClick={() => togglePassword(String(field.name))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:text-foreground"
                  tabIndex={-1}
                >
                  {showPasswords[String(field.name)] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          )}
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
