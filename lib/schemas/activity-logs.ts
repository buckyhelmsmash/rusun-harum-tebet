import { z } from "zod";

export const activityListParamsSchema = z.object({
  unitId: z.string().optional(),
  action: z.string().optional(),
  actorId: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
});

export type ActivityListParams = z.infer<typeof activityListParamsSchema>;
