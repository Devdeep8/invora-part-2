'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { storage } from '@/utils/storage'
import type { User } from '@/types/auth.types'

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = (err: unknown) => {
    setError(err instanceof Error ? err.message : 'Something went wrong')
    setLoading(false)
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authService.login({ email, password })
      setUser(res.data.user)
      
      router.push('/dashboard')
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, username: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authService.register({ email, username, password })
      setUser(res.data.user)
      router.push('/dashboard')
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    storage.clearTokens()
    setUser(null)
    router.push('/login')
  }

  return { user, loading, error, login, register, logout }
}
