import { z } from 'zod'
import { FieldConfig } from '@/common/form/AuthForm'

export const step1Schema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  phone: z.string().optional(),
  country: z.string().optional(),
  currency: z.string().optional(),
  website: z.string().optional(),
})

export const step2Schema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  taxId: z.string().optional(),
})

export const step3Schema = z.object({
  bankName: z.string().optional(),
  bankAccountNo: z.string().optional(),
  bankIfsc: z.string().optional(),
  upiId: z.string().optional(),
  invoicePrefix: z.string().optional(),
})

export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>

export const step1Fields: FieldConfig<Step1Data>[] = [
  { name: 'businessName', label: 'Business Name', required: true, placeholder: 'Acme Corp' },
  { name: 'phone', label: 'Phone Number', placeholder: '+1 555 000 0000' },
  { name: 'country', label: 'Country', placeholder: 'United States' },
  { 
    name: 'currency', 
    label: 'Currency', 
    placeholder: 'Select a currency',
    type: 'select',
    options: [
      { label: 'USD ($)', value: 'USD' },
      { label: 'EUR (€)', value: 'EUR' },
      { label: 'GBP (£)', value: 'GBP' },
      { label: 'INR (₹)', value: 'INR' },
      { label: 'AUD ($)', value: 'AUD' },
      { label: 'CAD ($)', value: 'CAD' },
    ]
  },
  { name: 'website', label: 'Website', placeholder: 'https://acme.com' },
]

export const step2Fields: FieldConfig<Step2Data>[] = [
  { name: 'address', label: 'Street Address', placeholder: '123 Main St' },
  { name: 'city', label: 'City', placeholder: 'New York' },
  { name: 'state', label: 'State/Province', placeholder: 'NY' },
  { name: 'zipCode', label: 'Zip/Postal Code', placeholder: '10001' },
  { name: 'taxId', label: 'Tax ID / VAT', placeholder: 'XX-XXXXXXX' },
]

export const step3Fields: FieldConfig<Step3Data>[] = [
  { name: 'bankName', label: 'Bank Name', placeholder: 'Chase Bank' },
  { name: 'bankAccountNo', label: 'Account Number', placeholder: '000123456789' },
  { name: 'bankIfsc', label: 'Routing / IFSC Code', placeholder: 'CHASXXXX' },
  { name: 'upiId', label: 'UPI ID (Optional)', placeholder: 'business@upi' },
  { name: 'invoicePrefix', label: 'Invoice Prefix', placeholder: 'INV-' },
]
