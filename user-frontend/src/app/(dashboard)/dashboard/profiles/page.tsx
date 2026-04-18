'use client'
import { useState } from 'react'
import { useDashboard } from '@/components/dashboard/DashboardProvider'
import { CreateProfileDialog } from '@/components/dashboard/CreateProfileDialog'
import type { Profile } from '@/types/profile.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { Plus, ArrowRight, ExternalLink, LayoutGrid } from 'lucide-react'

function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <Card className="group bg-card border-border hover:border-primary/40 hover:shadow-lg transition-all duration-150">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-11 w-11 shrink-0 border-2 border-border">
            <AvatarImage src={profile.avatarUrl || ''} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {profile.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-foreground truncate">{profile.name}</h3>
              <Badge
                className={
                  profile.isActive
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200 text-xs'
                    : 'bg-muted text-muted-foreground text-xs'
                }
                variant="outline"
              >
                {profile.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">phachankoun.com/{profile.slug}</p>
            {profile.bio && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{profile.bio}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`/${profile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              title="View public page"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-all duration-150"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Link
              href={`/dashboard/profiles/${profile.id}`}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-lg shadow-sm shadow-primary/20 hover:bg-primary/90 transition-all duration-150"
            >
              Manage
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProfilesPage() {
  const { profiles, refetchProfiles } = useDashboard()
  const [createOpen, setCreateOpen] = useState(false)

  const handleProfileCreated = async (newProfile: Profile) => {
    await refetchProfiles()
    setCreateOpen(false)
    void newProfile
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            My Profiles
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {profiles.length} profile{profiles.length !== 1 ? 's' : ''} in your account
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all duration-150"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Profile</span>
        </Button>
      </div>

      {profiles.length === 0 ? (
        <Card className="border-dashed border-2 border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <LayoutGrid className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">No profiles yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Create your first profile to start sharing your links with the world.
            </p>
            <Button
              className="mt-6 bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 stagger-children">
          {profiles.map((p) => (
            <ProfileCard key={p.id} profile={p} />
          ))}
        </div>
      )}

      <CreateProfileDialog open={createOpen} onOpenChange={setCreateOpen} onSuccess={handleProfileCreated} />
    </div>
  )
}
