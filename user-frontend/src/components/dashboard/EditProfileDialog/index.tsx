'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { profileService } from '@/services/profile.service'
import type { Profile } from '@/types/profile.types'
interface Props { 
  open: boolean
  onOpenChange: (v: boolean) => void
  profile: Profile | null
  onUpdate: (p: Profile) => void 
}

export function EditProfileDialog({ open, onOpenChange, profile, onUpdate }: Props) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    if (profile) {
      reset({ name: profile.name, bio: profile.bio || '', avatarUrl: profile.avatarUrl || '' })
    }
  }, [profile, reset])

  const onSubmit = async (data: any) => {
    if (!profile) return
    setLoading(true)
    try {
      const updated = await profileService.updateProfile(profile.id, data)
      onUpdate(updated)
      onOpenChange(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Edit Profile Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground/80">Display Name</Label>
            <Input 
              className="bg-muted/50 border-border h-11" 
              placeholder="John Doe" 
              {...register('name', { required: 'Name is required' })} 
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message as string}</p>}
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground/80">Bio</Label>
            <textarea 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder="Tell people a little about yourself..."
              {...register('bio')}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground/80">Avatar Image URL</Label>
            <Input 
              className="bg-muted/50 border-border h-11" 
              placeholder="https://example.com/image.png" 
              {...register('avatarUrl')} 
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-muted-foreground">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
