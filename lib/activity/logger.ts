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
/**
 * Compares an existing object with an update payload and returns an array of changes.
 * Ignores undefined values in the update payload and system fields (starting with $).
 */
export function getChanges<T extends object, U extends object>(
  oldObj: T,
  newObj: U,
): Array<{ field: string; old: unknown; new: unknown }> {
  const changes: Array<{ field: string; old: unknown; new: unknown }> = [];

  const oldRecord = oldObj as Record<string, unknown>;
  const newRecord = newObj as Record<string, unknown>;

  for (const [key, newValue] of Object.entries(newRecord)) {
    if (newValue === undefined || key.startsWith("$")) continue;

    const oldValue = oldRecord[key];

    // Simple equality check (works well enough for primitives used in updates)
    if (oldValue !== newValue) {
      changes.push({
        field: key,
        old: oldValue ?? null,
        new: newValue ?? null,
      });
    }
  }

  return changes;
}

export function logActivity(params: LogActivityParams): void {
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
  };

  doLog().catch((error) => {
    console.error("[Activity Logger] Failed to log:", error);
  });
}
