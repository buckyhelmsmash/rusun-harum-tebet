import { z } from "zod";

export const activityListParamsSchema = z.object({
  unitId: z.string().optional(),
  targetId: z.string().optional(),
  targetType: z.string().optional(),
  action: z.string().optional(),
  actorId: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
  /** JSON-encoded context for query-side bulk log merging (e.g. `{"unitDisplayId":"A-101"}`) */
  bulkContext: z.string().optional(),
});

export type ActivityListParams = z.infer<typeof activityListParamsSchema>;

export interface BulkContext {
  unitDisplayId?: string;
  invoiceNumber?: string;
}
