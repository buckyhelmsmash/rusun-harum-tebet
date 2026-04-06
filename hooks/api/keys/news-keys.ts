export interface NewsFilters {
  search?: string;
  limit?: number;
  offset?: number;
}

export const newsKeys = {
  all: ["news"] as const,
  lists: () => [...newsKeys.all, "list"] as const,
  list: (filters?: NewsFilters) => [...newsKeys.lists(), { filters }] as const,
  detail: (id: string) => [...newsKeys.all, "detail", id] as const,
  labels: () => [...newsKeys.all, "labels"] as const,
};
