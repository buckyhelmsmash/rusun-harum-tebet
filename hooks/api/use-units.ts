import {
  type UseMutationOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ApiClient } from "@/lib/api/api-client";
import type {
  GetUnitResponse,
  GetUnitsResponse,
  UpdateUnitPayload,
  UpdateUnitResponse,
} from "@/types/api";
import { unitKeys } from "./keys/unit-keys";

export interface UnitFilters {
  block?: string;
  floor?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

function buildQueryString(filters: UnitFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "" && value !== "all") {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const useGetUnits = (filters: UnitFilters = {}) => {
  return useQuery({
    queryKey: unitKeys.list(filters),
    queryFn: async () => {
      const qs = buildQueryString(filters);
      return await ApiClient.get<GetUnitsResponse>(`/api/units${qs}`);
    },
  });
};

export const useGetUnit = (id?: string | null) => {
  return useQuery({
    queryKey: unitKeys.detail(id as string),
    queryFn: async () => {
      return await ApiClient.get<GetUnitResponse>(`/api/units/${id}`);
    },
    enabled: !!id,
  });
};

interface UpdateUnitVariables extends UpdateUnitPayload {
  id: string;
}

export const useUpdateUnit = (
  options?: UseMutationOptions<UpdateUnitResponse, Error, UpdateUnitVariables>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateUnitVariables) => {
      return await ApiClient.patch<UpdateUnitPayload, UpdateUnitResponse>(
        `/api/units/${payload.id}`,
        { data: payload.data },
      );
    },
    ...options,
    onSuccess: async (...args) => {
      const [_data, variables] = args;
      queryClient.invalidateQueries({ queryKey: unitKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: unitKeys.detail(variables.id),
      });

      if (options?.onSuccess) {
        await options.onSuccess(...args);
      }
    },
  });
};
