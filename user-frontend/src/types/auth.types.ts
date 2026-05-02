export interface User {
  id: number
  email: string
  business?: any
  role: 'USER' | 'ADMIN'
  authProvider: 'LOCAL' | 'GOOGLE'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Profile {
  id: number
  userId: number
  slug: string
  name: string
  bio?: string
  avatarUrl?: string
  theme: string
  isActive: boolean
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    profile: Profile
    accessToken: string
    refreshToken: string
  }
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
}
