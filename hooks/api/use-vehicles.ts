import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { unitKeys } from "@/hooks/api/keys/unit-keys";
import {
  type VehicleFilters,
  vehicleKeys,
} from "@/hooks/api/keys/vehicle-keys";
import { ApiClient } from "@/lib/api/api-client";
import type { Vehicle } from "@/types";
import type { GetVehiclesResponse } from "@/types/api";

function buildVehicleQueryString(filters: VehicleFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "" && value !== "all") {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useGetVehicles(filters: VehicleFilters = {}) {
  return useQuery({
    queryKey: vehicleKeys.list(filters),
    queryFn: async () => {
      const qs = buildVehicleQueryString(filters);
      return await ApiClient.get<GetVehiclesResponse>(
        `/api/vehicles/list${qs}`,
      );
    },
  });
}

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
      queryClient.invalidateQueries({
        queryKey: vehicleKeys.lists(),
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
      queryClient.invalidateQueries({
        queryKey: vehicleKeys.lists(),
      });
    },
  });
}
