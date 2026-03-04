export interface ResidentFilters {
  search?: string;
  limit?: number;
  offset?: number;
}

export const ownerKeys = {
  all: ["owners"] as const,
  lists: () => [...ownerKeys.all, "list"] as const,
  list: (filters?: ResidentFilters) =>
    [...ownerKeys.lists(), { filters }] as const,
  detail: (id: string) => [...ownerKeys.all, "detail", id] as const,
};

export const tenantKeys = {
  all: ["tenants"] as const,
  lists: () => [...tenantKeys.all, "list"] as const,
  list: (filters?: ResidentFilters) =>
    [...tenantKeys.lists(), { filters }] as const,
  detail: (id: string) => [...tenantKeys.all, "detail", id] as const,
};
