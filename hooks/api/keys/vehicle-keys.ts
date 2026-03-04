export interface VehicleFilters {
  search?: string;
  vehicleType?: string;
  limit?: number;
  offset?: number;
}

export const vehicleKeys = {
  all: ["vehicles"] as const,
  lists: () => [...vehicleKeys.all, "list"] as const,
  list: (filters?: VehicleFilters) =>
    [...vehicleKeys.lists(), { filters }] as const,
};
