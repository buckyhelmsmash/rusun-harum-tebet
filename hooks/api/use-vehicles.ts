import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import type { Vehicle } from "@/types";

// Note: We don't typically need a useGetVehicles hook because vehicles
// are fetched as part of the Unit relations in useGetUnit.

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Vehicle> & { unit: string }) => {
      return apiClient.post<{ result: Vehicle }>("/api/vehicles", data);
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific unit query to refresh its vehicles list
      queryClient.invalidateQueries({ queryKey: ["unit", variables.unit] });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
      unitId,
    }: {
      id: string;
      data: Partial<Vehicle>;
      unitId: string;
    }) => {
      return apiClient.patch<{ result: Vehicle }>(`/api/vehicles/${id}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["unit", variables.unitId] });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, unitId }: { id: string; unitId: string }) => {
      return apiClient.delete<{ result: { success: boolean } }>(
        `/api/vehicles/${id}`,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["unit", variables.unitId] });
    },
  });
}
