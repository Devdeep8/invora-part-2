'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { userService } from '@/services/user.service'
import { profileService } from '@/services/profile.service'
import type { User } from '@/types/auth.types'
import type { Profile } from '@/types/profile.types'
import Cookies from 'js-cookie'

interface DashboardContextValue {
  user: User | null
  profiles: Profile[]
  loading: boolean
  refetchProfiles: () => Promise<void>
  logout: () => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used inside DashboardProvider')
  return ctx
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  const refetchProfiles = useCallback(async () => {
    const data = await profileService.getProfiles()
    setProfiles(data)
  }, [])

  const logout = useCallback(() => {
    Cookies.remove('accessToken')
    router.push('/login')
  }, [router])

  useEffect(() => {
    const init = async () => {
      try {
        const me = await userService.getMe()
        setUser(me)
      } catch {
        Cookies.remove('accessToken')
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  return (
    <DashboardContext.Provider value={{ user, profiles, loading, refetchProfiles, logout }}>
      {children}
    </DashboardContext.Provider>
  )
}
