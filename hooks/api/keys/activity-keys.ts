export interface ActivityFilters {
  unitId?: string;
  targetId?: string;
  targetType?: string;
  action?: string;
  actorId?: string;
  search?: string;
  limit?: number;
  offset?: number;
  /** Serialized JSON; used for query-side bulk log merging. */
  bulkContext?: string;
}

export const activityKeys = {
  all: ["activity"] as const,
  lists: () => [...activityKeys.all, "list"] as const,
  list: (filters?: ActivityFilters) =>
    [...activityKeys.lists(), { filters }] as const,
};
