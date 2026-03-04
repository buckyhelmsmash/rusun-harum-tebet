import { Query } from "node-appwrite";
import { APPWRITE } from "@/lib/constants";
import type { ActivityListParams } from "@/lib/schemas/activity-logs";
import type { ActivityLog } from "@/types";
import { DEFAULT_LIMIT, getAdminDb, type PaginatedResult } from "./base";

const TABLE_ID = APPWRITE.COLLECTIONS.ACTIVITY_LOGS;
const DB_ID = APPWRITE.DATABASE_ID;

export const ActivityLogRepository = {
  async list(
    params: ActivityListParams,
  ): Promise<PaginatedResult<ActivityLog>> {
    const db = await getAdminDb();
    const limit = params.limit ?? DEFAULT_LIMIT;
    const offset = params.offset ?? 0;

    const queries: string[] = [
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc("$createdAt"),
    ];

    if (params.unitId) queries.push(Query.equal("unitId", params.unitId));
    if (params.targetId) queries.push(Query.equal("targetId", params.targetId));
    if (params.action) queries.push(Query.equal("action", params.action));
    if (params.actorId) queries.push(Query.equal("actorId", params.actorId));

    const result = await db.listRows({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      queries,
    });

    return {
      items: result.rows as unknown as ActivityLog[],
      total: result.total,
      limit,
      offset,
    };
  },
};
