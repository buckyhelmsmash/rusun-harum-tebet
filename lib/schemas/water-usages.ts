import { z } from "zod";

export const waterUsageSchema = z.object({
  $id: z.string(),
  $createdAt: z.string(),
  $updatedAt: z.string(),
  unit: z.union([
    z.string(),
    z.object({
      $id: z.string(),
      displayId: z.string(),
    }),
  ]),
  period: z.string(),
  previousMeter: z.number(),
  currentMeter: z.number(),
  usage: z.number(),
  amount: z.number(),
  isBilled: z.boolean(),
});

export type WaterUsage = z.infer<typeof waterUsageSchema>;

export const createWaterUsageSchema = z.object({
  unit: z.string(),
  period: z.string(),
  previousMeter: z.number().min(0),
  currentMeter: z.number().min(0),
  usage: z.number().min(0),
  amount: z.number().min(0),
  isBilled: z.boolean().default(false),
});

export type CreateWaterUsageInput = z.infer<typeof createWaterUsageSchema>;

export const updateWaterUsageSchema = createWaterUsageSchema.partial();

export type UpdateWaterUsageInput = z.infer<typeof updateWaterUsageSchema>;

export const waterUsageListParamsSchema = z.object({
  limit: z.number().optional().default(25),
  offset: z.number().optional().default(0),
  period: z.string().optional(),
  unitId: z.string().optional(),
  isBilled: z.boolean().optional(),
});

export type WaterUsageListParams = z.infer<typeof waterUsageListParamsSchema>;

export const excelImportRowSchema = z.object({
  "Unit ID": z.string().min(1),
  "Previous Meter": z.number().min(0),
  "Current Meter": z.number().min(0),
});

export type ExcelImportRow = z.infer<typeof excelImportRowSchema>;
