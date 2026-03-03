import { NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE } from "@/lib/constants";

export async function GET(request: Request) {
  try {
    const { tablesDb } = await createAdminClient();
    const { searchParams } = new URL(request.url);

    const queries: string[] = [Query.limit(500), Query.orderAsc("displayId")];

    // Optional filters from search params
    const block = searchParams.get("block");
    if (block) queries.push(Query.equal("block", block));

    const floor = searchParams.get("floor");
    if (floor) queries.push(Query.equal("floor", Number.parseInt(floor, 10)));

    const status = searchParams.get("status");
    if (status) queries.push(Query.equal("occupancyStatus", status));

    const search = searchParams.get("search");
    if (search) queries.push(Query.contains("displayId", search));

    const unitsData = await tablesDb.listRows({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.UNITS,
      queries,
    });

    return NextResponse.json({ result: unitsData.rows });
  } catch (error: any) {
    console.error("GET /api/units - Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch units" },
      { status: 500 },
    );
  }
}
