import { z } from "zod";

const baseResidentSchema = z.object({
  fullName: z.string().min(1, "Nama lengkap wajib diisi").max(255),
  phoneNumber: z.string().min(1, "Nomor telepon wajib diisi").max(20),
  ktpNumber: z.string().regex(/^\d{16}$/, "KTP harus tepat 16 digit"),
  email: z.string().email().nullable().optional(),
  dateOfBirth: z.string().min(1, "Tanggal lahir wajib diisi"),
});

export const createOwnerSchema = baseResidentSchema;
export type CreateOwnerInput = z.infer<typeof createOwnerSchema>;

export const updateOwnerSchema = baseResidentSchema
  .omit({ ktpNumber: true })
  .partial()
  .strict();
export type UpdateOwnerInput = z.infer<typeof updateOwnerSchema>;

export const createTenantSchema = baseResidentSchema.extend({
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});
export type CreateTenantInput = z.infer<typeof createTenantSchema>;

export const updateTenantSchema = baseResidentSchema
  .omit({ ktpNumber: true })
  .extend({
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
  })
  .partial()
  .strict();
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;

export const residentListParamsSchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
});
export type ResidentListParams = z.infer<typeof residentListParamsSchema>;
