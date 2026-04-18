import api from './api'
import type { User } from '@/types/auth.types'

export const userService = {
  getMe: async (): Promise<User> => {
    const { data } = await api.get('/api/v1/user/me')
    return data.data
  },
}
