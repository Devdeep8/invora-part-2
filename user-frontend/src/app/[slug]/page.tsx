'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { profileService } from '@/services/profile.service'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Profile } from '@/types/profile.types'
import type { Link } from '@/types/link.types'

export default function PublicProfilePage() {
  const { slug } = useParams()
  const [profile, setProfile] = useState<(Profile & { links: Link[] }) | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) profileService.getPublicProfile(slug as string).then(setProfile).finally(() => setLoading(false))
  }, [slug])

  const handleClick = async (e: React.MouseEvent, link: Link) => {
    e.preventDefault()
    profileService.trackClick(link.id) // Fire and forget
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }

  if (loading || !profile) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-start pt-16 pb-8 px-4 select-none">
      <div className="w-full max-w-md space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24 ring-4 ring-purple-500/20 shadow-2xl shadow-purple-500/20">
            <AvatarImage src={profile.avatarUrl || ''} className="object-cover" />
            <AvatarFallback className="bg-purple-600 text-2xl font-bold text-white">{profile.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">@{profile.slug}</h1>
            {profile.bio && <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{profile.bio}</p>}
          </div>
        </div>

        {/* Links Container */}
        <div className="space-y-3">
          {profile.links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              onClick={(e) => handleClick(e, link)}
              className="flex items-center justify-center w-full h-14 rounded-2xl text-center font-medium text-sm text-white
                         bg-zinc-900/80 border border-zinc-800/50 backdrop-blur-sm
                         hover:bg-zinc-800/80 hover:border-purple-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10
                         active:translate-y-0 active:shadow-none
                         transition-all duration-200 ease-out px-6"
            >
              {link.title}
            </a>
          ))}
        </div>

        {/* Branding Footer */}
        <div className="pt-8 text-center">
          <p className="text-xs font-medium text-zinc-600 hover:text-zinc-500 transition-colors cursor-default">
            Powered by Phachankoun
          </p>
        </div>
      </div>
    </div>
  )
}
