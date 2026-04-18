import { z } from 'zod'

export const createProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  bio: z.string().max(150, 'Bio must be under 150 characters').optional(),
})

export type CreateProfileSchema = z.infer<typeof createProfileSchema>
