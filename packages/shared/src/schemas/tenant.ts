import { z } from 'zod'

export const TenantSchema = z.object({
  name: z
    .string()
    .min(1, 'Tenant name is required')
    .min(3, 'Tenant name must be at least 3 characters')
    .max(100, 'Tenant name must not exceed 100 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .max(50, 'Slug must not exceed 50 characters'),
})

export type TenantFormData = z.infer<typeof TenantSchema>
