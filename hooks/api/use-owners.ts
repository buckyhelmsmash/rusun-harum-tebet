import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activityKeys } from "@/hooks/api/keys/activity-keys";
import {
  ownerKeys,
  type ResidentFilters,
} from "@/hooks/api/keys/resident-keys";
import { ApiClient } from "@/lib/api/api-client";
import type { Owner } from "@/types";
import type { GetOwnersResponse } from "@/types/api";

function buildQueryString(filters: ResidentFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useGetOwners(filters: ResidentFilters = {}) {
  return useQuery({
    queryKey: ownerKeys.list(filters),
    queryFn: async () => {
      const qs = buildQueryString(filters);
      return await ApiClient.get<GetOwnersResponse>(`/api/owners${qs}`);
    },
  });
}

export function useCreateOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Partial<Owner>, "units">) => {
      return ApiClient.post<typeof data, { result: Owner }>(
        "/api/owners",
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ownerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
    },
  });
}

export function useUpdateOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Owner> }) => {
      return ApiClient.patch<typeof data, { result: Owner }>(
        `/api/owners/${id}`,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ownerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
    },
  });
}

export function useDeleteOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return ApiClient.delete<{ result: { success: boolean } }>(
        `/api/owners/${id}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ownerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
    },
  });
}
