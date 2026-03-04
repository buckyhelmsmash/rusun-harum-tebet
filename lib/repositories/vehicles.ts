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
      items: result.rows as unknown as Vehicle[],
      total: result.total,
      limit,
      offset,
    };
  },

  async create(data: CreateVehicleInput): Promise<Vehicle> {
    const db = await getAdminDb();
    const row = await db.createRow({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      rowId: ID.unique(),
      data,
    });
    return row as unknown as Vehicle;
  },

  async update(id: string, data: UpdateVehicleInput): Promise<Vehicle> {
    const db = await getAdminDb();
    const row = await db.updateRow({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      rowId: id,
      data,
    });
    return row as unknown as Vehicle;
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
