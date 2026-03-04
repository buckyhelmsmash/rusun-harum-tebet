import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api/api-client";
import type { GetUnitResponse } from "@/types/api";
import { activityKeys } from "./keys/activity-keys";
import { ownerKeys, tenantKeys } from "./keys/resident-keys";
import { unitKeys } from "./keys/unit-keys";

interface AssignResidentPayload {
  unitId: string;
  type: "owner" | "tenant";
  residentId: string;
  startDate?: string | null;
  endDate?: string | null;
}

interface RemoveResidentPayload {
  unitId: string;
  type: "owner" | "tenant";
}

export const useAssignResident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AssignResidentPayload) => {
      return await ApiClient.post<
        Omit<AssignResidentPayload, "unitId">,
        GetUnitResponse
      >(`/api/units/${payload.unitId}/assign`, {
        type: payload.type,
        residentId: payload.residentId,
        startDate: payload.startDate,
        endDate: payload.endDate,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: unitKeys.detail(variables.unitId),
      });
      queryClient.invalidateQueries({ queryKey: unitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ownerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
    },
  });
};

export const useRemoveResident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RemoveResidentPayload) => {
      return await ApiClient.delete<GetUnitResponse>(
        `/api/units/${payload.unitId}/assign`,
        { body: JSON.stringify({ type: payload.type }) },
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: unitKeys.detail(variables.unitId),
      });
      queryClient.invalidateQueries({ queryKey: unitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ownerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
    },
  });
};
