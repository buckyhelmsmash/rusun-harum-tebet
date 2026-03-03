import { Query } from "node-appwrite";
import { APPWRITE } from "@/lib/constants";
import type { UnitListParams, UpdateUnitInput } from "@/lib/schemas/units";
import type { Unit } from "@/types";
import { DEFAULT_LIMIT, getAdminDb, type PaginatedResult } from "./base";

const TABLE_ID = APPWRITE.COLLECTIONS.UNITS;
const DB_ID = APPWRITE.DATABASE_ID;

export const UnitRepository = {
  async list(params: UnitListParams): Promise<PaginatedResult<Unit>> {
    const db = await getAdminDb();
    const limit = params.limit ?? DEFAULT_LIMIT;
    const offset = params.offset ?? 0;

    const queries: string[] = [
      Query.limit(limit),
      Query.offset(offset),
      Query.orderAsc("displayId"),
    ];

    if (params.block) queries.push(Query.equal("block", params.block));
    if (params.floor) queries.push(Query.equal("floor", params.floor));
    if (params.status)
      queries.push(Query.equal("occupancyStatus", params.status));
    if (params.search) queries.push(Query.contains("displayId", params.search));

    const result = await db.listRows({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      queries,
    });

    return {
      items: result.rows as unknown as Unit[],
      total: result.total,
      limit,
      offset,
    };
  },

  async getById(id: string): Promise<Unit> {
    const db = await getAdminDb();
    const row = await db.getRow({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      rowId: id,
    });
    return row as unknown as Unit;
  },

  async update(id: string, data: UpdateUnitInput): Promise<Unit> {
    const db = await getAdminDb();
    const row = await db.updateRow({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      rowId: id,
      data,
    });
    return row as unknown as Unit;
  },
};
