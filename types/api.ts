import type { Unit } from "@/types";

/**
 * Standard API Response wrapper for all endpoints
 */
export interface ApiResponse<T> {
  result?: T;
  message?: string;
  error?: string;
}

/**
 * UNIT ENDPOINTS
 */

// GET /api/units
export type GetUnitsResponse = Unit[];

// GET /api/units/:id
export type GetUnitResponse = Unit;

// PATCH /api/units/:id
export interface UpdateUnitPayload {
  data: Partial<Unit>;
}
export type UpdateUnitResponse = Unit;
