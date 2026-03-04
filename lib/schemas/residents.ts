import { z } from "zod";

const baseResidentSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(255),
  phoneNumber: z.string().min(1, "Phone number is required").max(20),
  ktpNumber: z.string().regex(/^\d{16}$/, "KTP must be exactly 16 digits"),
  email: z.string().email().nullable().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

export const createOwnerSchema = baseResidentSchema;
export type CreateOwnerInput = z.infer<typeof createOwnerSchema>;

export const updateOwnerSchema = baseResidentSchema.partial().strict();
export type UpdateOwnerInput = z.infer<typeof updateOwnerSchema>;

export const createTenantSchema = baseResidentSchema.extend({
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});
export type CreateTenantInput = z.infer<typeof createTenantSchema>;

export const updateTenantSchema = createTenantSchema.partial().strict();
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;

export const residentListParamsSchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
});
export type ResidentListParams = z.infer<typeof residentListParamsSchema>;
