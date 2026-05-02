import api from './api'
import type {
  Invoice,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  UpdateInvoiceStatusPayload,
  InvoiceListResponse,
} from '@/types/invoice.types'

// Backend response wrapper type
type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  locale: string
  timestamp: string
}

export const invoiceService = {
  list: async (params?: { status?: string; page?: number; limit?: number }) => {
    const { data } = await api.get<ApiResponse<InvoiceListResponse>>('/api/v1/invoices', { params })
    return data.data
  },

  getById: async (id: string | number) => {
    const { data } = await api.get<ApiResponse<Invoice>>(`/api/v1/invoices/${id}`)
    return data.data
  },

  create: async (payload: CreateInvoicePayload) => {
    const { data } = await api.post<ApiResponse<Invoice>>('/api/v1/invoices', payload)
    return data.data
  },

  update: async (id: string | number, payload: UpdateInvoicePayload) => {
    const { data } = await api.put<ApiResponse<Invoice>>(`/api/v1/invoices/${id}`, payload)
    return data.data
  },

  delete: async (id: string | number) => {
    const { data } = await api.delete<ApiResponse<{ message: string }>>(`/api/v1/invoices/${id}`)
    return data.data
  },

  send: async (id: string | number) => {
    const { data } = await api.post<ApiResponse<{ message: string }>>(`/api/v1/invoices/${id}/send`)
    return data.data
  },

  updateStatus: async (id: string | number, payload: UpdateInvoiceStatusPayload) => {
    const { data } = await api.patch<ApiResponse<Invoice>>(`/api/v1/invoices/${id}/status`, payload)
    return data.data
  },

  getPublicInvoice: async (publicId: string) => {
    const { data } = await api.get<ApiResponse<Invoice>>(`/api/v1/track/invoice/view/${publicId}`)
    return data.data
  },
}
