import { NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { APPWRITE } from "@/lib/constants";
import { getAdminDb, getErrorMessage } from "@/lib/repositories/base";
import type { Unit } from "@/types";

const DB_ID = APPWRITE.DATABASE_ID;

interface RawWaterUsage {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  unit: string | { $id: string; displayId: string };
  period: string;
  previousMeter: number;
  currentMeter: number;
  usage: number;
  amount: number;
  isBilled: boolean;
}

export async function GET(request: Request) {
  try {
    try {
      await verifyAuth(request);
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") || "25");
    const offset = Number(searchParams.get("offset") || "0");
    const period = searchParams.get("period");
    const unitId = searchParams.get("unitId");

    const queries = [];
    if (period) {
      queries.push(Query.equal("period", period));
    }
    if (unitId) {
      queries.push(Query.equal("unit", unitId));
    }

    queries.push(Query.orderDesc("period"));
    queries.push(Query.limit(limit));
    queries.push(Query.offset(offset));

    const db = await getAdminDb();
    const result = await db.listRows({
      databaseId: DB_ID,
      tableId: APPWRITE.COLLECTIONS.WATER_USAGES,
      queries,
    });

    const rows = result.rows as unknown as RawWaterUsage[];

    // Batch-resolve unit IDs to displayId
    const rawUnitIds = [
      ...new Set(
        rows
          .map((r) => (typeof r.unit === "string" ? r.unit : null))
          .filter((id): id is string => id !== null),
      ),
    ];

    let unitMap = new Map<string, string>();
    if (rawUnitIds.length > 0) {
      const unitResult = await db.listRows({
        databaseId: DB_ID,
        tableId: APPWRITE.COLLECTIONS.UNITS,
        queries: [
          Query.equal("$id", rawUnitIds),
          Query.select(["$id", "displayId"]),
          Query.limit(rawUnitIds.length),
        ],
      });

      unitMap = new Map(
        (unitResult.rows as unknown as Unit[]).map((u) => [u.$id, u.displayId]),
      );
    }

    const enrichedRows = rows.map((row) => ({
      ...row,
      unit:
        typeof row.unit === "string"
          ? { $id: row.unit, displayId: unitMap.get(row.unit) || row.unit }
          : row.unit,
    }));

    return NextResponse.json({ ...result, rows: enrichedRows });
  } catch (error) {
    console.error("[water-usages-list]", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
