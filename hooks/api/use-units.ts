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

export const useGetUnits = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: unitKeys.list(filters),
    queryFn: async () => {
      // In a real scenario, convert filters to URL search params
      return await ApiClient.get<GetUnitsResponse>("/api/units");
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
