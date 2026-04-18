import api from './api'
import type { Profile } from '@/types/profile.types'
import type { Link } from '@/types/link.types'

export const profileService = {
  getProfiles: async (): Promise<Profile[]> => { const { data } = await api.get('/api/v1/user/profiles'); return data.data },
  createProfile: async (payload: any): Promise<Profile> => { const { data } = await api.post('/api/v1/user/profiles', payload); return data.data },
  updateProfile: async (id: number, payload: any): Promise<Profile> => { const { data } = await api.put(`/api/v1/profiles/${id}`, payload); return data.data },
  
  // Links
  getProfileLinks: async (profileId: number): Promise<Link[]> => { const { data } = await api.get(`/api/v1/profiles/${profileId}/links`); return data.data },
  createLink: async (profileId: number, payload: any): Promise<Link> => { const { data } = await api.post(`/api/v1/profiles/${profileId}/links`, payload); return data.data },
  updateLink: async (linkId: number, payload: any): Promise<Link> => { const { data } = await api.put(`/api/v1/links/${linkId}`, payload); return data.data },
  deleteLink: async (linkId: number): Promise<void> => { await api.delete(`/api/v1/links/${linkId}`) },
  reorderLinks: async (links: { id: number, sortOrder: number }[]): Promise<void> => { await api.put('/api/v1/links/reorder', { links }) },

  // Public
  getPublicProfile: async (slug: string): Promise<Profile & { links: Link[] }> => { const { data } = await api.get(`/api/v1/p/${slug}`); return data.data },
  trackClick: async (linkId: number): Promise<void> => { await api.post(`/api/v1/links/${linkId}/track`) }
}
