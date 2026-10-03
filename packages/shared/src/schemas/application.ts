import { z } from 'zod'

export const ApplicationSchema = z.object({
  name: z
    .string()
    .min(1, 'Application name is required')
    .min(3, 'Application name must be at least 3 characters')
    .max(100, 'Application name must not exceed 100 characters'),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters'),
  app_id: z
    .string()
    .min(1, 'App ID is required')
    .min(3, 'App ID must be at least 3 characters')
    .regex(/^[a-z0-9-_]+$/, 'App ID can only contain lowercase letters, numbers, hyphens, and underscores')
    .max(50, 'App ID must not exceed 50 characters'),
})

export type ApplicationFormData = z.infer<typeof ApplicationSchema>
