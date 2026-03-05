import { NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { APPWRITE } from "@/lib/constants";
import { getAdminDb, getErrorMessage } from "@/lib/repositories/base";

const DB_ID = APPWRITE.DATABASE_ID;

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

    // Always sort by period descending
    queries.push(Query.orderDesc("period"));
    queries.push(Query.limit(limit));
    queries.push(Query.offset(offset));

    const db = await getAdminDb();
    const result = await db.listRows({
      databaseId: DB_ID,
      tableId: APPWRITE.COLLECTIONS.WATER_USAGES,
      queries,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[water-usages-list]", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
