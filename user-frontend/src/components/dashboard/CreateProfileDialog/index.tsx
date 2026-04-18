'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createProfileSchema, type CreateProfileSchema } from '@/lib/validations/profile.schema'
import { useCreateProfile } from './useCreateProfile'
import type { Profile } from '@/types/profile.types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (profile: Profile) => void
}

export function CreateProfileDialog({ open, onOpenChange, onSuccess }: Props) {
  const { create, loading, error } = useCreateProfile()
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateProfileSchema>({
    resolver: zodResolver(createProfileSchema),
  })

  const onSubmit = async (data: CreateProfileSchema) => {
    try {
      const newProfile = await create(data)
      reset()
      onSuccess(newProfile)
    } catch (err) {}
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) reset()
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Create New Profile</DialogTitle>
          <DialogDescription>Add a new link-in-bio page to your account.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground/80">Name</Label>
            <Input id="name" placeholder="John Doe" className="bg-muted/50" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium text-foreground/80">Slug</Label>
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground bg-muted rounded-l-md px-3 h-10 flex items-center border border-r-0 border-border">phachankoun.com/</span>
              <Input id="slug" placeholder="johndoe" className="bg-muted/50 rounded-l-none" {...register('slug')} />
            </div>
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium text-foreground/80">Bio <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <textarea 
              id="bio" 
              placeholder="Tell people a little about yourself..." 
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              {...register('bio')}
            />
            {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
              {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : 'Create Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
