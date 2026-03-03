import type { Unit } from "@/types";

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * UNIT ENDPOINTS
 */

// GET /api/units
export type GetUnitsResponse = PaginatedResponse<Unit>;

// GET /api/units/:id
export type GetUnitResponse = Unit;

// PATCH /api/units/:id
export interface UpdateUnitPayload {
  data: Partial<Unit>;
}
export type UpdateUnitResponse = Unit;
