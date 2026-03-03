import { ID } from "node-appwrite";
import { APPWRITE } from "@/lib/constants";
import type {
  CreateVehicleInput,
  UpdateVehicleInput,
} from "@/lib/schemas/vehicles";
import type { Vehicle } from "@/types";
import { getAdminDb } from "./base";

const TABLE_ID = APPWRITE.COLLECTIONS.VEHICLES;
const DB_ID = APPWRITE.DATABASE_ID;

export const VehicleRepository = {
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
