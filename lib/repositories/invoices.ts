import { ID, Query } from "node-appwrite";
import { APPWRITE } from "@/lib/constants";
import type {
  CreateInvoiceInput,
  InvoiceListParams,
  UpdateInvoiceInput,
} from "@/lib/schemas/invoices";
import type { Invoice } from "@/types";
import { DEFAULT_LIMIT, getAdminDb, type PaginatedResult } from "./base";

const TABLE_ID = APPWRITE.COLLECTIONS.INVOICES;
const DB_ID = APPWRITE.DATABASE_ID;

function mapRowToInvoice(row: unknown): Invoice {
  const invoice = row as Invoice;
  if (invoice.unit) {
    invoice.unitId =
      typeof invoice.unit === "string"
        ? invoice.unit
        : (invoice.unit as { $id?: string }).$id;
  }
  return invoice;
}

const VALID_ORDER_FIELDS = ["arrears", "totalDue", "period", "$createdAt"];

async function getUnitIdsForBlock(block: string): Promise<string[]> {
  const db = await getAdminDb();
  const result = await db.listRows({
    databaseId: DB_ID,
    tableId: APPWRITE.COLLECTIONS.UNITS,
    queries: [
      Query.equal("block", block),
      Query.limit(200),
      Query.select(["$id"]),
    ],
  });
  return result.rows.map((row) => (row as unknown as { $id: string }).$id);
}

export const InvoiceRepository = {
  async list(params: InvoiceListParams): Promise<PaginatedResult<Invoice>> {
    const db = await getAdminDb();
    const limit = params.limit ?? DEFAULT_LIMIT;
    const offset = params.offset ?? 0;

    const queries: string[] = [Query.limit(limit), Query.offset(offset)];

    if (params.status) queries.push(Query.equal("status", params.status));
    if (params.period) queries.push(Query.equal("period", params.period));

    // Search by unit displayId (2-step: find matching units, then filter invoices)
    if (params.search) {
      const searchUnits = await db.listRows({
        databaseId: DB_ID,
        tableId: APPWRITE.COLLECTIONS.UNITS,
        queries: [
          Query.contains("displayId", params.search),
          Query.limit(200),
          Query.select(["$id"]),
        ],
      });
      const searchUnitIds = searchUnits.rows.map(
        (row) => (row as unknown as { $id: string }).$id,
      );
      if (searchUnitIds.length === 0) {
        return { items: [], total: 0, limit, offset };
      }
      queries.push(Query.equal("unit", searchUnitIds));
    }

    if (params.block) {
      const unitIds = await getUnitIdsForBlock(params.block);
      if (unitIds.length === 0) {
        return { items: [], total: 0, limit, offset };
      }
      queries.push(Query.equal("unit", unitIds));
    }

    if (params.orderBy && VALID_ORDER_FIELDS.includes(params.orderBy)) {
      queries.push(Query.orderDesc(params.orderBy));
    } else {
      queries.push(Query.orderDesc("$createdAt"));
    }

    const result = await db.listRows({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      queries,
    });

    const invoices = result.rows.map(mapRowToInvoice);

    // Expand unit relationships so columns can access displayId, owner, tenant
    const unitIds = [
      ...new Set(
        invoices.map((inv) => inv.unitId).filter((id): id is string => !!id),
      ),
    ];

    if (unitIds.length > 0) {
      const unitRows = await Promise.all(
        unitIds.map((id) =>
          db
            .getRow({
              databaseId: DB_ID,
              tableId: APPWRITE.COLLECTIONS.UNITS,
              rowId: id,
            })
            .catch(() => null),
        ),
      );

      const unitMap = new Map<string, Record<string, unknown>>();
      for (const row of unitRows) {
        if (row) {
          const r = row as unknown as { $id: string };
          unitMap.set(r.$id, row as unknown as Record<string, unknown>);
        }
      }

      for (const inv of invoices) {
        if (inv.unitId && unitMap.has(inv.unitId)) {
          (inv as unknown as Record<string, unknown>).unit = unitMap.get(
            inv.unitId,
          );
        }
      }
    }

    return {
      items: invoices,
      total: result.total,
      limit,
      offset,
    };
  },

  async getById(id: string): Promise<Invoice> {
    const db = await getAdminDb();
    const row = await db.getRow({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      rowId: id,
    });
    return mapRowToInvoice(row);
  },

  async getByAccessToken(token: string): Promise<Invoice | null> {
    const db = await getAdminDb();
    const result = await db.listRows({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      queries: [Query.equal("accessToken", token), Query.limit(1)],
    });
    if (result.total === 0) return null;
    return mapRowToInvoice(result.rows[0]);
  },

  async create(data: CreateInvoiceInput): Promise<Invoice> {
    const db = await getAdminDb();
    const row = await db.createRow({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      rowId: ID.unique(),
      data,
    });
    return mapRowToInvoice(row);
  },

  async update(id: string, data: UpdateInvoiceInput): Promise<Invoice> {
    const db = await getAdminDb();
    const row = await db.updateRow({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      rowId: id,
      data,
    });
    return mapRowToInvoice(row);
  },
};
