import { z } from "zod";

export const ApplicationSchema = z.object({
  name: z
    .string()
    .min(1, "Application name is required")
    .min(3, "Application name must be at least 3 characters")
    .max(100, "Application name must not exceed 100 characters"),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
});

export type ApplicationFormData = z.infer<typeof ApplicationSchema>;
