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

export const InvoiceRepository = {
  async list(params: InvoiceListParams): Promise<PaginatedResult<Invoice>> {
    const db = await getAdminDb();
    const limit = params.limit ?? DEFAULT_LIMIT;
    const offset = params.offset ?? 0;

    const queries: string[] = [
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc("$createdAt"),
    ];

    if (params.status) queries.push(Query.equal("status", params.status));
    if (params.period) queries.push(Query.equal("period", params.period));
    if (params.search) queries.push(Query.search("period", params.search));

    const result = await db.listRows({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      queries,
    });

    return {
      items: result.rows.map(mapRowToInvoice),
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
