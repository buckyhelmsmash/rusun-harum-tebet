import { useQuery } from "@tanstack/react-query";
import {
  type ActivityFilters,
  activityKeys,
} from "@/hooks/api/keys/activity-keys";
import { ApiClient } from "@/lib/api/api-client";
import type { GetActivityResponse } from "@/types/api";

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

export function useGetActivity(filters: ActivityFilters = {}) {
  return useQuery({
    queryKey: activityKeys.list(filters),
    queryFn: async () => {
      const qs = buildActivityQueryString(filters);
      return await ApiClient.get<GetActivityResponse>(`/api/activity${qs}`);
    },
    refetchInterval: 10000,
  });
}
