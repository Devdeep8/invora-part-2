'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useDashboard } from '@/components/dashboard/DashboardProvider'
import { CreateProfileDialog } from '@/components/dashboard/CreateProfileDialog'
import type { Profile } from '@/types/profile.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ArrowRight,
  Link2,
  MousePointerClick,
  LayoutGrid,
  Plus,
  Sparkles,
  ExternalLink,
} from 'lucide-react'

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  color: string
}) {
  return (
    <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-150">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  )
}

function ProfileListCard({ profile }: { profile: Profile }) {
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

export default function OverviewPage() {
  const { user, profiles, refetchProfiles } = useDashboard()
  const [createOpen, setCreateOpen] = useState(false)

  const totalLinks = 0 // Aggregation would need per-profile link fetches
  const totalClicks = 0

  const handleProfileCreated = async (newProfile: Profile) => {
    await refetchProfiles()
    setCreateOpen(false)
    void newProfile // consumed via refetch
  }

  if (!user) return null

  return (
    <div className="space-y-6 stagger-children">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 shadow-sm animate-fade-up">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-wider">Creator Studio</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back, {user.username}! 👋
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {profiles.length === 0
                  ? 'Create your first profile and start sharing your links.'
                  : `You have ${profiles.length} profile${profiles.length > 1 ? 's' : ''} ready to go.`}
              </p>
            </div>
            {profiles.length > 0 && (
              <Button
                size="sm"
                className="hidden sm:flex bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20 shrink-0 transition-all duration-150"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up">
        <StatCard
          icon={LayoutGrid}
          label="Total Profiles"
          value={profiles.length}
          color="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          icon={Link2}
          label="Total Links"
          value={totalLinks}
          color="bg-violet-100 text-violet-600"
        />
        <StatCard
          icon={MousePointerClick}
          label="Total Clicks"
          value={totalClicks}
          color="bg-emerald-100 text-emerald-600"
        />
      </div>

      {/* Profiles Section */}
      <div className="animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Your Profiles</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Select a profile to manage its links</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-dashed hover:border-primary hover:text-primary transition-all duration-150"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Create Profile</span>
          </Button>
        </div>

        {profiles.length === 0 ? (
          <Card className="border-dashed border-2 border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Link2 className="h-7 w-7 text-primary" />
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
            {profiles.map((profile) => (
              <ProfileListCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>

      <CreateProfileDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleProfileCreated}
      />
    </div>
  )
}
