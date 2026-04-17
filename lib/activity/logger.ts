import { ID } from "node-appwrite";
import { APPWRITE } from "@/lib/constants";
import { getAdminDb } from "@/lib/repositories/base";
import type { ActivityAction, TargetType } from "@/types";
import type { ActivityMetadataMap } from "./types";

const TABLE_ID = APPWRITE.COLLECTIONS.ACTIVITY_LOGS;
const DB_ID = APPWRITE.DATABASE_ID;

const MAX_METADATA_BYTES = 8_000;

const SKIP_DIFF_FIELDS = new Set(["content", "summary", "coverImage"]);

type LogActivityParams<A extends ActivityAction = ActivityAction> = {
  actorId: string;
  actorName: string;
  action: A;
  description: string;
  targetType: TargetType;
  targetId?: string;
  unitId?: string;
  metadata?: A extends keyof ActivityMetadataMap
    ? ActivityMetadataMap[A]
    : Record<string, unknown>;
};

/**
 * Fire-and-forget activity logger.
 * Writes to Appwrite but NEVER throws — if logging fails,
 * we console.error and move on so the primary operation isn't affected.
 */
export function logActivity<A extends ActivityAction>(
  params: LogActivityParams<A>,
): void {
  const doLog = async () => {
    let serialized: string | null = null;

    if (params.metadata) {
      serialized = JSON.stringify(params.metadata);

      if (new Blob([serialized]).size > MAX_METADATA_BYTES) {
        console.warn(
          `[Activity Logger] Metadata exceeds ${MAX_METADATA_BYTES}B for ${params.action}, truncating.`,
        );
        serialized = JSON.stringify({ _truncated: true, action: params.action });
      }
    }

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
        metadata: serialized,
      },
    });
  };

  doLog().catch((error) => {
    console.error("[Activity Logger] Failed to log:", error);
  });
}

/**
 * Compares an existing object with an update payload and returns an array of changes.
 * Skips system fields (starting with $) and large text fields (content, summary, coverImage).
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
    if (SKIP_DIFF_FIELDS.has(key)) continue;

    const oldValue = oldRecord[key];

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
