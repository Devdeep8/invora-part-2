#!/bin/bash
set -e

BACKEND_DIR="../user-backend"
FRONTEND_DIR="."

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Phachankoun — Enable Edit Flow"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. Backend: Get Links for a Profile ────
echo "📁 Adding backend get links service..."
cat > $BACKEND_DIR/src/services/link/getProfileLinks.service.js << 'EOF'
import { BaseService } from '@/src/lib/base.service.js'
import { AppError } from '@/src/errors/app.error.js'
import { Errors } from '@/src/errors/errorCodes.js'

export default class GetProfileLinksService extends BaseService {
  validate() {}
  async run() {
    const { profileId } = this.args
    const userId = this.context.userId
    if (!userId) throw new AppError(Errors.AUTH_INVALID_CREDENTIALS, { traceId: this.traceId })

    const profile = await this.db.profile.findFirst({ where: { id: profileId, userId } })
    if (!profile) throw new AppError(Errors.AUTH_INVALID_CREDENTIALS, { traceId: this.traceId })

    return await this.db.link.findMany({
      where: { profileId },
      orderBy: { sortOrder: 'asc' }
    })
  }
}
EOF

echo "🔧 Updating backend controller..."
# Append new method to existing controller
cat >> $BACKEND_DIR/src/rest-resources/controllers/profile.controller.js << 'EOF'

// Appended by Edit Flow script
import GetProfileLinksService from "../../services/link/getProfileLinks.service.js"
export default class ProfileControllerPatch extends ProfileController {
  static async getProfileLinks(req, res, next) {
    try { const result = await GetProfileLinksService.execute({ profileId: req.params.profileId }, req.context); sendResponse({ req, res, next }, result) } catch (e) { next(e) }
  }
}
EOF

# Fix: Overwriting controller cleanly to avoid ES6 class override issues
cat > $BACKEND_DIR/src/rest-resources/controllers/profile.controller.js << 'EOF'
import { sendResponse } from "../../helpers/response.helpers"
import GetPublicProfileService from "../../services/profile/getPublicProfile.service.js"
import CreateLinkService from "../../services/link/createLink.service.js"
import UpdateLinkService from "../../services/link/updateLink.service.js"
import DeleteLinkService from "../../services/link/deleteLink.service.js"
import ReorderLinksService from "../../services/link/reorderLinks.service.js"
import TrackClickService from "../../services/link/trackClick.service.js"
import GetProfileLinksService from "../../services/link/getProfileLinks.service.js"

export default class ProfileController {
  static async getPublicProfile(req, res, next) {
    try { const result = await GetPublicProfileService.execute({ slug: req.params.slug }, req.context); sendResponse({ req, res, next }, result) } catch (e) { next(e) }
  }
  static async getProfileLinks(req, res, next) {
    try { const result = await GetProfileLinksService.execute({ profileId: req.params.profileId }, req.context); sendResponse({ req, res, next }, result) } catch (e) { next(e) }
  }
  static async createLink(req, res, next) {
    try { const result = await CreateLinkService.execute({ ...req.body, profileId: req.params.profileId }, req.context); sendResponse({ req, res, next }, result) } catch (e) { next(e) }
  }
  static async updateLink(req, res, next) {
    try { const result = await UpdateLinkService.execute({ ...req.body, linkId: req.params.linkId }, req.context); sendResponse({ req, res, next }, result) } catch (e) { next(e) }
  }
  static async deleteLink(req, res, next) {
    try { const result = await DeleteLinkService.execute({ linkId: req.params.linkId }, req.context); sendResponse({ req, res, next }, result) } catch (e) { next(e) }
  }
  static async reorderLinks(req, res, next) {
    try { const result = await ReorderLinksService.execute(req.body, req.context); sendResponse({ req, res, next }, result) } catch (e) { next(e) }
  }
  static async trackClick(req, res, next) {
    try { await TrackClickService.execute({ linkId: req.params.linkId }, req.context); sendResponse({ req, res, next }, { success: true }) } catch (e) { next(e) }
  }
}
EOF

echo "🛣️ Updating backend routes..."
cat > $BACKEND_DIR/src/rest-resources/routes/api/v1/profile.routes.js << 'EOF'
import express from 'express'
import { contextMiddleware } from '../../../../middlewares/context.middleware.js'
import { authMiddleware } from '../../../../middlewares/auth.middleware.js'
import ProfileController from '../../../../controllers/profile.controller.js'

const profileRoutes = express.Router()

// Public
profileRoutes.route('/p/:slug').get(contextMiddleware(), ProfileController.getPublicProfile)
profileRoutes.route('/links/:linkId/track').post(contextMiddleware(), ProfileController.trackClick)

// Protected
profileRoutes.route('/profiles/:profileId/links').get(contextMiddleware(), authMiddleware(), ProfileController.getProfileLinks)
profileRoutes.route('/profiles/:profileId/links').post(contextMiddleware(), authMiddleware(), ProfileController.createLink)
profileRoutes.route('/links/reorder').put(contextMiddleware(), authMiddleware(), ProfileController.reorderLinks)
profileRoutes.route('/links/:linkId').put(contextMiddleware(), authMiddleware(), ProfileController.updateLink)
profileRoutes.route('/links/:linkId').delete(contextMiddleware(), authMiddleware(), ProfileController.deleteLink)

export default profileRoutes
EOF


# ── 2. Frontend Service Update ─────────────
echo "📡 Updating frontend services..."
cat > $FRONTEND_DIR/src/services/profile.service.ts << 'EOF'
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
EOF

# ── 3. Frontend Dashboard Update ───────────
echo "✍️  Rewriting Dashboard with Edit flow..."
cat > $FRONTEND_DIR/src/app/\(dashboard\)/dashboard/page.tsx << 'EOF'
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { userService } from '@/services/user.service'
import { profileService } from '@/services/profile.service'
import type { User } from '@/types/auth.types'
import type { Profile } from '@/types/profile.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, Plus, Link2, ArrowLeft, Pencil } from 'lucide-react'
import { CreateProfileDialog } from '@/components/dashboard/CreateProfileDialog'
import { EditProfileDialog } from '@/components/dashboard/EditProfileDialog'
import { StudioEditor } from '@/components/dashboard/StudioEditor'
import Cookies from 'js-cookie'

type ViewType = 'grid' | 'studio'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  
  // View State
  const [view, setView] = useState<ViewType>('grid')
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null)
  
  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const me = await userService.getMe()
        setUser(me)
        const myProfiles = await profileService.getProfiles()
        setProfiles(myProfiles)
      } catch (error) {
        Cookies.remove('accessToken')
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  const handleLogout = () => {
    Cookies.remove('accessToken')
    router.push('/login')
  }

  const handleProfileCreated = (newProfile: Profile) => {
    setProfiles((prev) => [newProfile, ...prev])
    setCreateDialogOpen(false)
  }

  const handleOpenStudio = (profile: Profile) => {
    setActiveProfile(profile)
    setView('studio')
  }

  const handleBackToGrid = () => {
    setView('grid')
    setActiveProfile(null)
  }

  const handleProfileUpdated = (updatedProfile: Profile) => {
    setActiveProfile(updatedProfile)
    setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p))
    setEditDialogOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) return null

  // ==========================================
  // STUDIO VIEW (Linktree Editor)
  // ==========================================
  if (view === 'studio' && activeProfile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBackToGrid} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground leading-tight">{activeProfile.name}</h1>
                <p className="text-xs text-muted-foreground">phachankoun.com/{activeProfile.slug}</p>
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)} className="gap-2">
              <Pencil className="h-3.5 w-3.5" />
              Edit Details
            </Button>
          </div>
        </header>

        <main className="container mx-auto max-w-3xl px-4 py-8">
          {/* The Linktree-style Drag & Drop Editor */}
          <StudioEditor profile={activeProfile} onUpdate={handleProfileUpdated} />
        </main>

        <EditProfileDialog 
          open={editDialogOpen} 
          onOpenChange={setEditDialogOpen} 
          profile={activeProfile} 
          onUpdate={handleProfileUpdated} 
        />
      </div>
    )
  }

  // ==========================================
  // GRID VIEW (Profile Selection)
  // ==========================================
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Link2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">Phachankoun</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{user.username}</span>
            </div>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Your Profiles</h1>
            <p className="text-sm text-muted-foreground mt-1">Select a profile to edit its links</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
            <Plus className="mr-2 h-4 w-4" />
            Create Profile
          </Button>
        </div>

        <Separator className="my-6" />

        {profiles.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Link2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No profiles yet</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                Create your first profile to start sharing your links with the world.
              </p>
              <Button className="mt-6 bg-primary hover:bg-primary/90" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <Card 
                key={profile.id} 
                className="group transition-all duration-200 hover:shadow-xl hover:border-primary/40 bg-card cursor-pointer"
                onClick={() => handleOpenStudio(profile)}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {profile.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base font-semibold text-foreground">{profile.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">/{profile.slug}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">
                    {profile.bio || 'No bio added yet.'}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant={profile.isActive ? 'default' : 'secondary'} className={profile.isActive ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : ''}>
                      {profile.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="outline" size="sm" className="h-8 text-xs opacity-70 group-hover:opacity-100 transition-opacity">
                      Edit Links
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <CreateProfileDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={handleProfileCreated} />
    </div>
  )
}
EOF

# ── 4. Fix StudioEditor to fetch links on load ──
echo "🛠️ Updating StudioEditor to fetch links..."
cat > $FRONTEND_DIR/src/components/dashboard/StudioEditor/index.tsx << 'EOF'
'use client'
import { useState, useEffect } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GripVertical, Pencil, Trash2, Plus, ExternalLink } from 'lucide-react'
import { profileService } from '@/services/profile.service'
import type { Profile } from '@/types/profile.types'
import type { Link } from '@/types/link.types'

const SOCIALS = [
  { name: 'Instagram', prefix: 'https://instagram.com/' },
  { name: 'Twitter', prefix: 'https://x.com/' },
  { name: 'YouTube', prefix: 'https://youtube.com/@' },
  { name: 'LinkedIn', prefix: 'https://linkedin.com/in/' },
  { name: 'GitHub', prefix: 'https://github.com/' },
]

interface Props { profile: Profile; onUpdate: (p: Profile) => void }

export function StudioEditor({ profile }: Props) {
  const [links, setLinks] = useState<Link[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    profileService.getProfileLinks(profile.id).then(setLinks).finally(() => setLoading(false))
  }, [profile.id])

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIdx = links.findIndex(l => l.id === active.id)
      const newIdx = links.findIndex(l => l.id === over.id)
      const reordered = arrayMove(links, oldIdx, newIdx).map((l, i) => ({ ...l, sortOrder: i }))
      setLinks(reordered)
      await profileService.reorderLinks(reordered.map(l => ({ id: l.id, sortOrder: l.sortOrder })))
    }
  }

  const handleAddSave = async () => {
    if (!title || !url) return
    const newLink = await profileService.createLink(profile.id, { title, url })
    setLinks(prev => [...prev, newLink])
    resetForm()
  }

  const handleEditSave = async () => {
    if (!editingId || !title || !url) return
    const updated = await profileService.updateLink(editingId, { title, url })
    setLinks(prev => prev.map(l => l.id === updated.id ? updated : l))
    resetForm()
  }

  const handleDelete = async (id: number) => {
    await profileService.deleteLink(id)
    setLinks(prev => prev.filter(l => l.id !== id))
  }

  const startEdit = (link: Link) => {
    setEditingId(link.id)
    setTitle(link.title)
    setUrl(link.url)
    setIsAdding(false)
  }

  const resetForm = () => {
    setIsAdding(false)
    setEditingId(null)
    setTitle('')
    setUrl('')
  }

  const applySocial = (prefix: string) => setUrl(prefix)

  if (loading) return <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={links.map(l => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {links.map((link) => (
              <SortableItem key={link.id} link={link} isEditing={editingId === link.id} title={title} url={url} setTitle={setTitle} setUrl={setUrl} onSave={handleEditSave} onCancel={resetForm} onDelete={handleDelete} onEdit={startEdit} onSocial={applySocial} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {!isAdding ? (
        <button onClick={() => { setIsAdding(true); resetForm() }} className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl text-sm font-medium text-zinc-400 border-2 border-dashed border-zinc-800 hover:border-purple-500/40 hover:text-purple-400 transition-all duration-200">
          <Plus className="h-5 w-5" /> Add new link
        </button>
      ) : (
        <div className="bg-zinc-900/50 border border-purple-500/30 rounded-2xl p-4 space-y-4">
          <div className="space-y-2">
            <Input className="bg-zinc-800 border-zinc-700 h-11" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <Input className="bg-zinc-800 border-zinc-700 h-11" placeholder="URL (e.g. https://...)" value={url} onChange={e => setUrl(e.target.value)} />
          </div>
          {!url.startsWith('http') && (
            <div className="flex flex-wrap gap-2">
              {SOCIALS.map(s => (
                <button key={s.name} type="button" onClick={() => applySocial(s.prefix)} className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors">{s.name}</button>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={resetForm} className="text-zinc-400">Cancel</Button>
            <Button size="sm" onClick={handleAddSave} className="bg-purple-600 hover:bg-purple-700 text-white">Save</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function SortableItem({ link, isEditing, title, url, setTitle, setUrl, onSave, onCancel, onDelete, onEdit, onSocial }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: link.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="bg-zinc-900/50 border border-purple-500/30 rounded-2xl p-4 space-y-4">
        <div className="space-y-2">
          <Input className="bg-zinc-800 border-zinc-700 h-11" value={title} onChange={e => setTitle(e.target.value)} />
          <Input className="bg-zinc-800 border-zinc-700 h-11" value={url} onChange={e => setUrl(e.target.value)} />
        </div>
        {!url.startsWith('http') && (
          <div className="flex flex-wrap gap-2">
            {SOCIALS.map(s => (
              <button key={s.name} type="button" onClick={() => onSocial(s.prefix)} className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors">{s.name}</button>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-zinc-400">Cancel</Button>
          <Button size="sm" onClick={onSave} className="bg-purple-600 hover:bg-purple-700 text-white">Update</Button>
        </div>
      </div>
    )
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-3 group hover:border-zinc-700 transition-colors">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400"><GripVertical className="h-5 w-5" /></button>
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-sm font-medium text-white truncate flex-1">{link.title}</span>
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-zinc-400"><ExternalLink className="h-4 w-4" /></a>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => onEdit(link)}><Pencil className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-400" onClick={() => onDelete(link.id)}><Trash2 className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}
EOF

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅  Edit Flow Enabled!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  User Flow:"
echo "  1. Dashboard Grid -> Click Profile Card"
echo "  2. Enters Studio View (Back button, Edit Details button)"
echo "  3. Studio View shows Drag & Drop links"
echo "  4. Click 'Edit Details' to change Name/Bio"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"