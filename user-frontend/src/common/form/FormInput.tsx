'use client'
import { forwardRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <Label htmlFor={props.name} className="text-sm text-white/70 font-medium">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </Label>
        )}
        <Input
          ref={ref}
          id={props.name}
          className={cn(
            'bg-white/5 border-white/10 text-white placeholder:text-white/20',
            'focus-visible:ring-indigo-500 focus-visible:border-indigo-500',
            'focus-visible:ring-offset-0 focus-visible:ring-[3px]',
            'focus-visible:bg-white/8 transition-all duration-200',
            error && 'border-red-400/60 focus-visible:ring-red-400/30',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-white/30">{hint}</p>}
      </div>
    )
  }
)
FormInput.displayName = 'FormInput'
export default FormInput