import api from './api'
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types/auth.types'

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post('/api/v1/user/login', payload)
    return data
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post('/api/v1/user/register', payload)
    return data
  },

  logout: async (): Promise<void> => {
    await api.post('/api/v1/user/logout')
  },

  getMe: async (): Promise<AuthResponse> => {
    const { data } = await api.get('/api/v1/user/me')
    return data
  },
}
