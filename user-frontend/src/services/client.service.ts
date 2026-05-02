import api from './api'
import type { Client, CreateClientPayload, UpdateClientPayload } from '@/types/invoice.types'

// Backend response wrapper type
type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  locale: string
  timestamp: string
}

export const clientService = {
  list: async () => {
    const { data } = await api.get<ApiResponse<Client[]>>('/api/v1/clients')
    return data.data || []
  },

  getById: async (id: string | number) => {
    const { data } = await api.get<ApiResponse<Client>>(`/api/v1/clients/${id}`)
    return data.data
  },

  create: async (payload: CreateClientPayload) => {
    const { data } = await api.post<ApiResponse<Client>>('/api/v1/clients', payload)
    return data.data
  },

  update: async (id: string | number, payload: UpdateClientPayload) => {
    const { data } = await api.put<ApiResponse<Client>>(`/api/v1/clients/${id}`, payload)
    return data.data
  },

  delete: async (id: string | number) => {
    const { data } = await api.delete<ApiResponse<{ message: string }>>(`/api/v1/clients/${id}`)
    return data.data
  },
}
