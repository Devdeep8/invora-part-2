import api from './api'
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types/auth.types'

// Backend response wrapper type
type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  locale: string
  timestamp: string
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/api/v1/user/login', payload)
    return data.data
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/api/v1/user/register', payload)
    return data.data
  },

  logout: async (): Promise<void> => {
    await api.post('/api/v1/user/logout')
  },

  getMe: async (): Promise<AuthResponse> => {
    const { data } = await api.get<ApiResponse<AuthResponse>>('/api/v1/user/me')
    return data.data
  },
}
