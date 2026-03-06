import { Query } from "node-appwrite";
import { APPWRITE } from "@/lib/constants";
import type {
  ActivityListParams,
  BulkContext,
} from "@/lib/schemas/activity-logs";
import type { ActivityLog } from "@/types";
import { DEFAULT_LIMIT, getAdminDb, type PaginatedResult } from "./base";

const TABLE_ID = APPWRITE.COLLECTIONS.ACTIVITY_LOGS;
const DB_ID = APPWRITE.DATABASE_ID;

const BULK_ACTIONS = ["water_usage.import", "invoice.generate"] as const;

function parseBulkContext(raw: string | undefined): BulkContext | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BulkContext;
  } catch {
    return null;
  }
}

function logMatchesBulkContext(log: ActivityLog, ctx: BulkContext): boolean {
  const raw = log.metadata;
  if (!raw) return false;

  // metadata is stored as JSON.stringify() in Appwrite, so parse it first
  let metadata: Record<string, unknown>;
  try {
    metadata =
      typeof raw === "string"
        ? JSON.parse(raw)
        : (raw as Record<string, unknown>);
  } catch {
    return false;
  }

  if (ctx.unitDisplayId && log.action === "water_usage.import") {
    const { unitDisplayId } = ctx;
    const units = metadata.processedUnits as
      | { displayId: string }[]
      | undefined;
    return (
      Array.isArray(units) &&
      units.some(
        (u) => u.displayId.toLowerCase() === unitDisplayId.toLowerCase(),
      )
    );
  }

  if (ctx.invoiceNumber && log.action === "invoice.generate") {
    const created = metadata.createdInvoices as
      | { invoiceNumber: string }[]
      | undefined;
    const updated = metadata.updatedInvoices as
      | { invoiceNumber: string }[]
      | undefined;
    const inCreated =
      Array.isArray(created) &&
      created.some((i) => i.invoiceNumber === ctx.invoiceNumber);
    const inUpdated =
      Array.isArray(updated) &&
      updated.some((i) => i.invoiceNumber === ctx.invoiceNumber);
    return inCreated || inUpdated;
  }

  return false;
}

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
    if (params.targetType)
      queries.push(Query.equal("targetType", params.targetType));
    if (params.action) queries.push(Query.equal("action", params.action));
    if (params.actorId) queries.push(Query.equal("actorId", params.actorId));
    if (params.search) queries.push(Query.search("description", params.search));

    const result = await db.listRows({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      queries,
    });

    let items = result.rows as unknown as ActivityLog[];
    let total = result.total;

    // Query-side bulk log merging: when a targetId is retrieved alongside
    // bulkContext, we also fetch matching bulk action logs and inject them.
    const ctx = parseBulkContext(params.bulkContext);
    if (ctx && params.targetId) {
      const bulkResults = await Promise.all(
        BULK_ACTIONS.map((action) =>
          db.listRows({
            databaseId: DB_ID,
            tableId: TABLE_ID,
            queries: [
              Query.equal("action", action),
              Query.orderDesc("$createdAt"),
              Query.limit(100),
            ],
          }),
        ),
      );

      const matchingBulkLogs = bulkResults
        .flatMap((r) => r.rows as unknown as ActivityLog[])
        .filter((log) => logMatchesBulkContext(log, ctx));

      if (matchingBulkLogs.length > 0) {
        const existingIds = new Set(items.map((l) => l.$id));
        const newLogs = matchingBulkLogs.filter((l) => !existingIds.has(l.$id));
        items = [...items, ...newLogs].sort(
          (a, b) =>
            new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime(),
        );
        total += newLogs.length;
      }
    }

    return { items, total, limit, offset };
  },
};
