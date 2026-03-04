import { ID, Query } from "node-appwrite";
import { APPWRITE } from "@/lib/constants";
import type {
  CreateOwnerInput,
  ResidentListParams,
  UpdateOwnerInput,
} from "@/lib/schemas/residents";
import type { Owner } from "@/types";
import { DEFAULT_LIMIT, getAdminDb, type PaginatedResult } from "./base";

const TABLE_ID = APPWRITE.COLLECTIONS.OWNERS;
const DB_ID = APPWRITE.DATABASE_ID;

function mapRowToOwner(row: unknown): Owner {
  return row as Owner;
}

export const OwnerRepository = {
  async list(params: ResidentListParams): Promise<PaginatedResult<Owner>> {
    const db = await getAdminDb();
    const limit = params.limit ?? DEFAULT_LIMIT;
    const offset = params.offset ?? 0;

    const queries: string[] = [
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc("$createdAt"),
    ];

    if (params.search) queries.push(Query.contains("fullName", params.search));

    const result = await db.listRows({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      queries,
    });

    return {
      items: result.rows.map(mapRowToOwner),
      total: result.total,
      limit,
      offset,
    };
  },

  async getById(id: string): Promise<Owner> {
    const db = await getAdminDb();
    const row = await db.getRow({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      rowId: id,
    });
    return mapRowToOwner(row);
  },

  async getByKtpNumber(ktpNumber: string): Promise<Owner | null> {
    const db = await getAdminDb();
    const result = await db.listRows({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      queries: [Query.equal("ktpNumber", ktpNumber), Query.limit(1)],
    });
    if (result.total === 0) return null;
    return mapRowToOwner(result.rows[0]);
  },

  async create(data: CreateOwnerInput): Promise<Owner> {
    const db = await getAdminDb();
    const row = await db.createRow({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      rowId: ID.unique(),
      data,
    });
    return mapRowToOwner(row);
  },

  async update(id: string, data: UpdateOwnerInput): Promise<Owner> {
    const db = await getAdminDb();
    const row = await db.updateRow({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      rowId: id,
      data,
    });
    return mapRowToOwner(row);
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
