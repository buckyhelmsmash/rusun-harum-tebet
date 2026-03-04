export interface ActivityFilters {
  unitId?: string;
  action?: string;
  actorId?: string;
  limit?: number;
  offset?: number;
}

export const activityKeys = {
  all: ["activity"] as const,
  lists: () => [...activityKeys.all, "list"] as const,
  list: (filters?: ActivityFilters) =>
    [...activityKeys.lists(), { filters }] as const,
};
