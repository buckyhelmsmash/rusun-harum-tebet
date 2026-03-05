import type {
  ActivityLog,
  Invoice,
  Owner,
  Tenant,
  Unit,
  Vehicle,
} from "@/types";

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

/**
 * VEHICLE ENDPOINTS
 */

// GET /api/vehicles/list
export type GetVehiclesResponse = PaginatedResponse<Vehicle>;

/**
 * RESIDENT ENDPOINTS
 */

// GET /api/owners
export type GetOwnersResponse = PaginatedResponse<Owner>;

// GET /api/tenants
export type GetTenantsResponse = PaginatedResponse<Tenant>;

/**
 * INVOICE ENDPOINTS
 */

// GET /api/invoices
export type GetInvoicesResponse = PaginatedResponse<Invoice>;

/**
 * ACTIVITY LOG ENDPOINTS
 */

// GET /api/activity
export type GetActivityResponse = PaginatedResponse<ActivityLog>;
