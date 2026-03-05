import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api/api-client";
import type { ActivityLog } from "@/types";
import { type ActivityFilters, activityKeys } from "./keys/activity-keys";

export interface GetActivityLogsResponse {
  items: ActivityLog[];
  total: number;
  limit: number;
  offset: number;
}

function buildActivityQueryString(filters: ActivityFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useGetActivityLogs(filters: ActivityFilters = {}) {
  return useQuery({
    queryKey: activityKeys.list(filters),
    queryFn: async () => {
      const qs = buildActivityQueryString(filters);
      return await ApiClient.get<GetActivityLogsResponse>(`/api/activity${qs}`);
    },
  });
}
