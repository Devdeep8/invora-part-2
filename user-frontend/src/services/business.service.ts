import api from './api'

// Backend response wrapper type
type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  locale: string
  timestamp: string
}

export interface CreateBusinessPayload {
  businessName: string
  phone?: string
  country?: string
  currency?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  taxId?: string
  website?: string
  taxRate?: number
  invoicePrefix?: string
  upiId?: string
  bankAccountNo?: string
  bankIfsc?: string
  bankName?: string
  tax?: number
}

export const businessService = {
  create: async (payload: CreateBusinessPayload) => {
    const { data } = await api.post<ApiResponse<any>>('/api/v1/business', payload)
    return data.data
  },
}
