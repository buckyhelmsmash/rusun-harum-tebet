import { Query } from "node-appwrite";
import { APPWRITE } from "@/lib/constants";
import type { UnitListParams, UpdateUnitInput } from "@/lib/schemas/units";
import type { Owner, Tenant, Unit, Vehicle } from "@/types";
import { DEFAULT_LIMIT, getAdminDb, type PaginatedResult } from "./base";

const TABLE_ID = APPWRITE.COLLECTIONS.UNITS;
const DB_ID = APPWRITE.DATABASE_ID;

// Helper to consistently map raw Appwrite row to our Unit type
function mapRowToUnit(row: unknown): Unit {
  const unit = row as Unit;
  // Safely extract relationship IDs whether they are expanded objects or plain strings
  if (unit.owner) {
    unit.ownerId =
      typeof unit.owner === "string"
        ? unit.owner
        : (unit.owner as { $id?: string }).$id;
  }
  if (unit.tenant) {
    unit.tenantId =
      typeof unit.tenant === "string"
        ? unit.tenant
        : (unit.tenant as { $id?: string }).$id;
  }
  return unit;
}

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

    const units = result.rows.map(mapRowToUnit);

    // Batch-resolve owner IDs so the list page can display owner names
    const ownerIds = [
      ...new Set(
        units
          .map((u) => (typeof u.owner === "string" ? u.owner : u.owner?.$id))
          .filter((id): id is string => !!id),
      ),
    ];

    if (ownerIds.length > 0) {
      const ownersResult = await db.listRows({
        databaseId: DB_ID,
        tableId: APPWRITE.COLLECTIONS.OWNERS,
        queries: [
          Query.equal("$id", ownerIds),
          Query.select(["$id", "fullName"]),
          Query.limit(ownerIds.length),
        ],
      });

      const ownerMap = new Map(
        (ownersResult.rows as unknown as Owner[]).map((o) => [o.$id, o]),
      );

      for (const unit of units) {
        const oid =
          typeof unit.owner === "string" ? unit.owner : unit.owner?.$id;
        if (oid && ownerMap.has(oid)) {
          unit.owner = ownerMap.get(oid) as Owner;
        }
      }
    }

    return {
      items: units,
      total: result.total,
      limit,
      offset,
    };
  },

  async getById(id: string): Promise<Unit> {
    const db = await getAdminDb();

    const [unitRow, vehiclesResult] = await Promise.all([
      db.getRow({
        databaseId: DB_ID,
        tableId: TABLE_ID,
        rowId: id,
      }),
      db
        .listRows({
          databaseId: DB_ID,
          tableId: APPWRITE.COLLECTIONS.VEHICLES,
          queries: [Query.equal("unit", id)],
        })
        .catch((err) => {
          console.warn(`Failed to fetch vehicles for unit ${id}:`, err);
          return { rows: [] };
        }),
    ]);

    const unit = mapRowToUnit(unitRow);

    // Appwrite manyToOne relationships may come back as plain string IDs.
    // Manually expand them into full objects when needed.
    const ownerRaw = unit.owner;
    const tenantRaw = unit.tenant;
    const ownerId = typeof ownerRaw === "string" ? ownerRaw : ownerRaw?.$id;
    const tenantId = typeof tenantRaw === "string" ? tenantRaw : tenantRaw?.$id;

    const [ownerDoc, tenantDoc] = await Promise.all([
      ownerId
        ? db
            .getRow({
              databaseId: DB_ID,
              tableId: APPWRITE.COLLECTIONS.OWNERS,
              rowId: ownerId,
            })
            .catch(() => null)
        : null,
      tenantId
        ? db
            .getRow({
              databaseId: DB_ID,
              tableId: APPWRITE.COLLECTIONS.TENANTS,
              rowId: tenantId,
            })
            .catch(() => null)
        : null,
    ]);

    return {
      ...unit,
      owner:
        (ownerDoc as unknown as Owner) ??
        (unit.owner && typeof unit.owner !== "string" ? unit.owner : undefined),
      tenant:
        (tenantDoc as unknown as Tenant) ??
        (unit.tenant && typeof unit.tenant !== "string"
          ? unit.tenant
          : undefined),
      ownerId,
      tenantId,
      vehicles: vehiclesResult.rows as unknown as Vehicle[],
    };
  },

  async update(id: string, data: UpdateUnitInput): Promise<Unit> {
    const db = await getAdminDb();
    const row = await db.updateRow({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      rowId: id,
      data,
    });
    return mapRowToUnit(row);
  },
};
