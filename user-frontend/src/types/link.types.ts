export interface Link {
  id: number
  profileId: number
  title: string
  url: string
  icon?: string
  sortOrder: number
  isActive: boolean
  clicks: number
}
