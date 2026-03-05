import { z } from "zod";

export const createVehicleSchema = z.object({
  vehicleType: z.enum(["car", "motorcycle"]),
  licensePlate: z
    .string()
    .transform((val) => val.toUpperCase().replace(/\s+/g, " ").trim())
    .pipe(
      z
        .string()
        .regex(
          /^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{0,3}$/,
          "Format plat tidak valid (misal: B 1234 ABC)",
        ),
    ),
  color: z.string().min(1, "Warna wajib diisi").max(30),
  brand: z.string().min(1, "Merek wajib diisi").max(50),
  unit: z.string().min(1),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;

export const updateVehicleSchema = createVehicleSchema
  .omit({ unit: true })
  .partial()
  .strict();

export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;

export const vehicleListParamsSchema = z.object({
  search: z.string().optional(),
  vehicleType: z.enum(["car", "motorcycle"]).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
});

export type VehicleListParams = z.infer<typeof vehicleListParamsSchema>;
