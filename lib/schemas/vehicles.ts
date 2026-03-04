import { z } from "zod";

export const createVehicleSchema = z.object({
  vehicleType: z.enum(["car", "motorcycle", "box_car"]),
  licensePlate: z.string().min(1).max(20),
  monthlyRate: z.number().min(0).nullable().optional(),
  color: z.string().max(30).nullable().optional(),
  brand: z.string().max(50).nullable().optional(),
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
  vehicleType: z.enum(["car", "motorcycle", "box_car"]).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
});

export type VehicleListParams = z.infer<typeof vehicleListParamsSchema>;
