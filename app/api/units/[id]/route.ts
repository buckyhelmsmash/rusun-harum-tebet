import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE } from "@/lib/constants";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { tablesDb } = await createAdminClient();

    const unitData = await tablesDb.getRow({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.UNITS,
      rowId: id,
    });

    return NextResponse.json({ result: unitData });
  } catch (error: any) {
    console.error(`GET /api/units - Error:`, error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch unit details" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { tablesDb } = await createAdminClient();
    const body = await request.json();

    // The payload wrapper is typically { data: { ...fields } }
    const patchData = body.data || body;

    const unitData = await tablesDb.updateRow({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.UNITS,
      rowId: id,
      data: patchData,
    });

    return NextResponse.json({ result: unitData });
  } catch (error: any) {
    console.error(`PATCH /api/units - Error:`, error);
    return NextResponse.json(
      { error: error?.message || "Failed to update unit" },
      { status: 500 },
    );
  }
}
