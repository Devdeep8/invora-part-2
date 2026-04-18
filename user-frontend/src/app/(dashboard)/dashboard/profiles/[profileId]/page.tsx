'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDashboard } from '@/components/dashboard/DashboardProvider'
import { profileService } from '@/services/profile.service'
import type { Profile } from '@/types/profile.types'
import { StudioEditor } from '@/components/dashboard/StudioEditor'
import { EditProfileDialog } from '@/components/dashboard/EditProfileDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ChevronRight,
  ExternalLink,
  Pencil,
  Home,
  AlertCircle,
} from 'lucide-react'

export default function ProfileStudioPage() {
  const { profileId } = useParams()
  const router = useRouter()
  const { profiles, refetchProfiles } = useDashboard()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [notFound, setNotFound] = useState(false)

  // Find profile from context or fetch
  useEffect(() => {
    const id = Number(profileId)
    if (isNaN(id)) { setNotFound(true); return }

    const found = profiles.find((p) => p.id === id)
    if (found) {
      setProfile(found)
    } else if (profiles.length > 0) {
      // profiles loaded but this ID not found
      setNotFound(true)
    }
    // If profiles.length === 0, still loading — wait
  }, [profileId, profiles])

  const handleProfileUpdated = useCallback(async (updated: Profile) => {
    setProfile(updated)
    await refetchProfiles()
    setEditOpen(false)
  }, [refetchProfiles])

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Profile not found</h2>
        <p className="text-sm text-muted-foreground mt-1">This profile doesn&apos;t exist or you don&apos;t have access.</p>
        <Button className="mt-4" onClick={() => router.push('/dashboard')}>
          <Home className="h-4 w-4 mr-1.5" />
          Back to Dashboard
        </Button>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Breadcrumb + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors duration-150">
            <Home className="h-3.5 w-3.5" />
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/dashboard" className="hover:text-foreground transition-colors duration-150">
            Profiles
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground truncate max-w-[140px]">{profile.name}</span>
        </nav>
        <a
          href={`/${profile.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors duration-150 border border-primary/30 rounded-md px-3 py-1.5 hover:bg-primary/5"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View Public Page
        </a>
      </div>

      {/* Profile Details Card */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-border shadow-sm">
                <AvatarImage src={profile.avatarUrl || ''} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-lg text-foreground">{profile.name}</CardTitle>
                  <Badge
                    variant="outline"
                    className={
                      profile.isActive
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 text-xs'
                        : 'bg-muted text-muted-foreground text-xs'
                    }
                  >
                    {profile.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  phachankoun.com/<span className="font-medium text-foreground">{profile.slug}</span>
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 hover:border-primary hover:text-primary transition-all duration-150"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Edit Details</span>
            </Button>
          </div>
        </CardHeader>
        {profile.bio && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
              {profile.bio}
            </p>
          </CardContent>
        )}
      </Card>

      {/* Links Editor Card */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-foreground">Links</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Drag to reorder. Click to edit.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <StudioEditor profile={profile} onUpdate={handleProfileUpdated} />
        </CardContent>
      </Card>

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={profile}
        onUpdate={handleProfileUpdated}
      />
    </div>
  )
}
