'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { businessService, CreateBusinessPayload } from '@/services/business.service'
import AuthForm from '@/common/form/AuthForm'
import { Button } from '@/components/ui/button'
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step1Fields,
  step2Fields,
  step3Fields,
} from './useOnboardingForm'

export default function OnboardingPage() {
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<Partial<CreateBusinessPayload>>({})

  const handleNextStep = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep(prev => prev + 1)
  }

  const handleSkipStep = () => {
    setStep(prev => prev + 1)
  }

  const handleFinalSubmit = async (data: any) => {
    const finalData = { ...formData, ...data }
    
    setLoading(true)
    setError(null)
    
    try {
      await businessService.create(finalData as CreateBusinessPayload)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create business')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-lg border border-border relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-in-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {step === 1 && "Welcome!"}
            {step === 2 && "Address Details"}
            {step === 3 && "Bank Details"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {step === 1 && "Let's start with the basics of your business."}
            {step === 2 && "Where is your business located? (Optional)"}
            {step === 3 && "How will you receive payments? (Optional)"}
          </p>
        </div>

        <div className="mt-6">
          {step === 1 && (
            <AuthForm
              schema={step1Schema}
              fields={step1Fields}
              onSubmit={handleNextStep}
              submitLabel="Next Step"
              defaultValues={formData}
            />
          )}

          {step === 2 && (
            <AuthForm
              schema={step2Schema}
              fields={step2Fields}
              onSubmit={handleNextStep}
              submitLabel="Next Step"
              defaultValues={formData}
            >
              <Button
                type="button"
                variant="outline"
                onClick={handleSkipStep}
                className="w-full mt-3 h-11 text-sm font-semibold border-border hover:bg-muted"
              >
                Skip for now
              </Button>
            </AuthForm>
          )}

          {step === 3 && (
            <AuthForm
              schema={step3Schema}
              fields={step3Fields}
              onSubmit={handleFinalSubmit}
              submitLabel="Finish & Create"
              loading={loading}
              error={error}
              defaultValues={formData}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => handleFinalSubmit({})}
                disabled={loading}
                className="w-full mt-3 h-11 text-sm font-semibold border-border hover:bg-muted"
              >
                Skip & Finish
              </Button>
            </AuthForm>
          )}
        </div>
      </div>
    </div>
  )
}
