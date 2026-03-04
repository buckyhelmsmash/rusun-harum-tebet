import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activityKeys } from "@/hooks/api/keys/activity-keys";
import {
  type ResidentFilters,
  tenantKeys,
} from "@/hooks/api/keys/resident-keys";
import { ApiClient } from "@/lib/api/api-client";
import type { Tenant } from "@/types";
import type { GetTenantsResponse } from "@/types/api";

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

export function useGetTenants(
  filters: ResidentFilters = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: tenantKeys.list(filters),
    queryFn: async () => {
      const qs = buildQueryString(filters);
      return await ApiClient.get<GetTenantsResponse>(`/api/tenants${qs}`);
    },
    enabled: options?.enabled,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Partial<Tenant>, "unit">) => {
      return ApiClient.post<typeof data, { result: Tenant }>(
        "/api/tenants",
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
    },
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Tenant> }) => {
      return ApiClient.patch<typeof data, { result: Tenant }>(
        `/api/tenants/${id}`,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
    },
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return ApiClient.delete<{ result: { success: boolean } }>(
        `/api/tenants/${id}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
    },
  });
}
