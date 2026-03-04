import { ID, Query } from "node-appwrite";
import { APPWRITE } from "@/lib/constants";
import type {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleListParams,
} from "@/lib/schemas/vehicles";
import type { Vehicle } from "@/types";
import { DEFAULT_LIMIT, getAdminDb, type PaginatedResult } from "./base";

const TABLE_ID = APPWRITE.COLLECTIONS.VEHICLES;
const DB_ID = APPWRITE.DATABASE_ID;

// Helper to consistently map raw Appwrite row to our Vehicle type
function mapRowToVehicle(row: unknown): Vehicle {
  const vehicle = row as Vehicle;
  // Safely extract unitId whether expanded object or plain string
  if (vehicle.unit) {
    vehicle.unitId =
      typeof vehicle.unit === "string"
        ? vehicle.unit
        : (vehicle.unit as { $id?: string }).$id;
  }
  return vehicle;
}

export const VehicleRepository = {
  async list(params: VehicleListParams): Promise<PaginatedResult<Vehicle>> {
    const db = await getAdminDb();
    const limit = params.limit ?? DEFAULT_LIMIT;
    const offset = params.offset ?? 0;

    const queries: string[] = [
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc("$createdAt"),
    ];

    if (params.vehicleType)
      queries.push(Query.equal("vehicleType", params.vehicleType));
    if (params.search)
      queries.push(Query.contains("licensePlate", params.search));

    const result = await db.listRows({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      queries,
    });

    return {
      items: result.rows.map(mapRowToVehicle),
      total: result.total,
      limit,
      offset,
    };
  },

  async getById(id: string): Promise<Vehicle> {
    const db = await getAdminDb();
    const row = await db.getRow({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      rowId: id,
    });
    return mapRowToVehicle(row);
  },

  async getByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    const db = await getAdminDb();
    const result = await db.listRows({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      queries: [Query.equal("licensePlate", licensePlate), Query.limit(1)],
    });

    if (result.total === 0) return null;
    return mapRowToVehicle(result.rows[0]);
  },

  async create(data: CreateVehicleInput): Promise<Vehicle> {
    const db = await getAdminDb();
    const row = await db.createRow({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      rowId: ID.unique(),
      data,
    });
    return mapRowToVehicle(row);
  },

  async update(id: string, data: UpdateVehicleInput): Promise<Vehicle> {
    const db = await getAdminDb();
    const row = await db.updateRow({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      rowId: id,
      data,
    });
    return mapRowToVehicle(row);
  },

  async delete(id: string): Promise<void> {
    const db = await getAdminDb();
    await db.deleteRow({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      rowId: id,
    });
  },
};
