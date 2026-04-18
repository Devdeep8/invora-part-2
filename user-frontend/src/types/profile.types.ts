export interface Profile {
  id: number
  userId: number
  slug: string
  name: string
  bio?: string
  avatarUrl?: string
  theme: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProfilePayload {
  name: string
  slug: string
  bio?: string
}
