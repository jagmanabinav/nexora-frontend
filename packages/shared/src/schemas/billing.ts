import { z } from "zod";

export const BillingPlanSchema = z.object({
  name: z
    .string()
    .min(1, "Plan name is required")
    .min(3, "Plan name must be at least 3 characters")
    .max(100, "Plan name must not exceed 100 characters"),
  slug: z
    .string()
    .min(1, "Plan slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Plan slug can only contain lowercase letters, numbers, and hyphens",
    ),
  application_code: z.string().min(1, "Application is required").max(100),
  tier: z.enum(["free", "starter", "professional", "enterprise"]),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
  monthly_price: z
    .number()
    .min(0, "Price must be 0 or greater")
    .max(999999, "Price must not exceed 999,999"),
  annual_price: z
    .number()
    .min(0, "Price must be 0 or greater")
    .max(999999, "Price must not exceed 999,999"),
  setup_fee: z.number().min(0).max(999999),
  max_users: z.number().int().min(-1),
  max_api_keys: z.number().int().min(-1),
  max_applications: z.number().int().min(-1),
  storage_gb: z.number().int().min(-1),
  api_requests_per_month: z.number().int().min(-1),
  support_level: z.string().min(1),
  sso_enabled: z.boolean(),
  advanced_analytics: z.boolean(),
  webhook_support: z.boolean(),
  custom_domain: z.boolean(),
  api_access: z.boolean(),
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
  display_order: z.number().int().min(0),
});

export type BillingPlanFormData = z.infer<typeof BillingPlanSchema>;
