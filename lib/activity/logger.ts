import { ID } from "node-appwrite";
import { APPWRITE } from "@/lib/constants";
import { getAdminDb } from "@/lib/repositories/base";
import type { ActivityAction, TargetType } from "@/types";

const TABLE_ID = APPWRITE.COLLECTIONS.ACTIVITY_LOGS;
const DB_ID = APPWRITE.DATABASE_ID;

interface LogActivityParams {
  actorId: string;
  actorName: string;
  action: ActivityAction;
  description: string;
  targetType: TargetType;
  targetId?: string;
  unitId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Fire-and-forget activity logger.
 * Writes to Appwrite but NEVER throws — if logging fails,
 * we console.error and move on so the primary operation isn't affected.
 */
export function logActivity(params: LogActivityParams): void {
  console.log(
    "[Activity Logger] Called with:",
    params.action,
    params.description,
  );

  const doLog = async () => {
    const db = await getAdminDb();
    await db.createRow({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      rowId: ID.unique(),
      data: {
        actorId: params.actorId,
        actorName: params.actorName,
        action: params.action,
        description: params.description,
        targetType: params.targetType,
        targetId: params.targetId ?? null,
        unitId: params.unitId ?? null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
    console.log("[Activity Logger] Success:", params.action);
  };

  doLog().catch((error) => {
    console.error("[Activity Logger] Failed to log:", params.action, error);
  });
}
