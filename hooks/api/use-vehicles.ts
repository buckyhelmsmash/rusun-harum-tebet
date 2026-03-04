import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unitKeys } from "@/hooks/api/keys/unit-keys";
import { ApiClient } from "@/lib/api/api-client";
import type { Vehicle } from "@/types";

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<Partial<Vehicle>, "unit"> & { unit: string },
    ) => {
      return ApiClient.post<typeof data, { result: Vehicle }>(
        "/api/vehicles",
        data,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: unitKeys.detail(variables.unit),
      });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Vehicle>;
      unitId: string;
    }) => {
      return ApiClient.patch<typeof data, { result: Vehicle }>(
        `/api/vehicles/${id}`,
        data,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: unitKeys.detail(variables.unitId),
      });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; unitId: string }) => {
      return ApiClient.delete<{ result: { success: boolean } }>(
        `/api/vehicles/${id}`,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: unitKeys.detail(variables.unitId),
      });
    },
  });
}
