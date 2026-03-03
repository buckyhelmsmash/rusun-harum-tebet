import { z } from "zod";

export const unitListSchema = z.object({
  block: z.enum(["A", "B", "C", "D"]).optional(),
  floor: z.coerce.number().int().min(1).max(20).optional(),
  status: z.enum(["owner_occupied", "rented", "vacant"]).optional(),
  search: z.string().min(1).max(50).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type UnitListParams = z.infer<typeof unitListSchema>;

export const updateUnitSchema = z
  .object({
    occupancyStatus: z.enum(["owner_occupied", "rented", "vacant"]).optional(),
    billRecipient: z.enum(["owner", "tenant"]).optional(),
    isOccupied: z.boolean().optional(),
    owner: z.string().nullable().optional(),
    tenant: z.string().nullable().optional(),
  })
  .strict();

export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
