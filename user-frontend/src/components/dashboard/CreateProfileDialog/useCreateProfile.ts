import { useState } from 'react'
import { profileService } from '@/services/profile.service'
import type { CreateProfileSchema } from '@/lib/validations/profile.schema'
import type { Profile } from '@/types/profile.types'

export function useCreateProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (data: CreateProfileSchema): Promise<Profile> => {
    setLoading(true)
    setError(null)
    try {
      const newProfile = await profileService.createProfile(data)
      return newProfile
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { create, loading, error }
}
