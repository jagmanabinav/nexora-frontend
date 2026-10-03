import { z } from 'zod'

export const BillingPlanSchema = z.object({
  name: z
    .string()
    .min(1, 'Plan name is required')
    .min(3, 'Plan name must be at least 3 characters')
    .max(100, 'Plan name must not exceed 100 characters'),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  price: z
    .number()
    .min(0, 'Price must be 0 or greater')
    .max(999999, 'Price must not exceed 999,999'),
  billing_period: z
    .enum(['monthly', 'yearly', 'quarterly'], {
      errorMap: () => ({ message: 'Billing period must be monthly, yearly, or quarterly' }),
    }),
  features: z
    .array(z.string()),
  max_users: z
    .number()
    .min(1, 'Max users must be at least 1')
    .optional(),
  is_active: z
    .boolean()
    .default(true),
})

export type BillingPlanFormData = z.infer<typeof BillingPlanSchema>
